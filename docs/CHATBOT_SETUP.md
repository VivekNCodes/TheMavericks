# AgroSaathi AI Sahayak (कृषि मित्र) - Chatbot Setup & Integration Guide

Welcome to the configuration and operational guide for **AgroSaathi AI Sahayak**, the multilingual conversational agricultural assistant powered by Google Gemini and grounded in validated Indian agronomic science.

---

## 1. Architectural Highlights

- **Model**: Google Gemini (`gemini-1.5-flash` on the Google AI Studio Free Tier).
- **Multilingual Support**: English (`en`), Hindi (`hi`), Marathi (`mr`), and Punjabi (`pa`).
- **Grounded Agricultural Knowledge**: Injected from ICAR package of practices, 6 Indian soil classifications (Alluvial, Black Cotton, Red/Yellow, Laterite, Desert/Sandy, Mountain/Loamy), foliar plant pathology, and real-time hyper-local weather via Open-Meteo.
- **Safety & Explanatory Guardrails**: Strictly avoids prescribing synthetic chemical doses or toxic pesticide mixtures; advocates Integrated Pest Management (IPM), cultural sanitation, and directs farmers to nearest Krishi Vigyan Kendras (KVK).
- **Graceful Offline Mode**: If `GEMINI_API_KEY` is absent or quota is exceeded, automatically falls back to AgroSaathi's built-in ICAR rule engine without throwing application errors.
- **Server-Side Route Handler**: The Gemini API key is isolated in `src/app/api/assistant/chat/route.ts` and never exposed to browser client bundles.

---

## 2. Google AI Studio Setup (Free Tier)

### Step 1: Create a Google AI Studio Account
1. Visit [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click on **"Get API key"** in the top navigation or left sidebar.

### Step 2: Generate an API Key
1. Click **"Create API key"** -> select or create a Google Cloud project.
2. Copy the generated key (format: `AIzaSy...`).
3. **Never share this key publicly or commit it to GitHub.**

### Step 3: Configure Local Environment
Add the key to your `.env.local` file (create it if not already present from `.env.example`):
```env
# Google Gemini API
GEMINI_API_KEY="AIzaSyYourGeneratedGeminiKeyHere"
GEMINI_MODEL="gemini-1.5-flash"
```

---

## 3. Free Tier Limits & Resource Management

The free tier for `gemini-1.5-flash` in Google AI Studio provides generous limits suitable for hackathon demonstrations and community farmer pilots:

| Metric | Free Tier Limit | AgroSaathi Safeguard |
|---|---|---|
| **Requests per Minute (RPM)** | 15 RPM | Built-in IP sliding-window limiter (25 req/min per IP) |
| **Tokens per Minute (TPM)** | 1,000,000 TPM | Context trimming (last 10 turns, max 1,200 chars per message) |
| **Requests per Day (RPD)** | 1,500 RPD | Built-in offline ICAR fallback engine if quota reached |
| **Cost** | $0.00 (Free) | No credit card required on AI Studio |

> [!TIP]
> Do not use `gemini-1.5-pro` for free-tier high-concurrency testing, as its free-tier rate limit is restricted to 2 RPM. `gemini-1.5-flash` is 10x faster and allows 15 RPM.

---

## 4. Grounded Context & System Prompting

The assistant executes a 2-stage grounding pipeline for every query:
1. **Agronomic Entity Detection**: Extracts mentioned crops (e.g., Tomato, Wheat, Paddy, Cotton), soils, or diseases (e.g., Early Blight, Late Blight, Yellow Rust) and retrieves verified ICAR agronomic profiles.
2. **Weather Telemetry Injection**: Fetches live temperature, humidity, precipitation probability, and wind speed from Open-Meteo for the farmer's district (e.g., Jaipur, Rajasthan).
3. **System Prompt Rules**:
   - Responds in the detected or selected language (English, Hindi, Marathi, or Punjabi).
   - Formats output with bullet points and bold highlights for legibility on mobile screens.
   - Identifies uncertainty instead of guessing spray formulations.

---

## 5. Session History & Persistence

- **Local Persistence**: All chat messages are stored locally in the browser's `localStorage` (`agrosaathi_chat_<sessionId>`).
- **Neon Cloud Persistence**: The route `/api/assistant/sessions` syncs sessions to the `ChatSession` table in Neon PostgreSQL if `DATABASE_URL` is configured.
- **Privacy & PII Protection**: Indian 10-digit phone numbers and email addresses are automatically scrubbed and redacted (`[REDACTED_PHONE]`) before sending prompts to the language model.

---

## 6. Vercel Deployment Instructions

### Step 1: Push Code to GitHub
Ensure changes are committed on your branch following project conventions:
```bash
git add .
git commit -m "feat(chatbot): integrate multilingual agricultural assistant"
git push origin feat/multilingual-chatbot
```

### Step 2: Configure Environment Variables in Vercel
1. Open your project on [Vercel Dashboard](https://vercel.com).
2. Go to **Settings** > **Environment Variables**.
3. Add the following keys:
   - `GEMINI_API_KEY`: Your Google AI Studio API key (`AIzaSy...`)
   - `GEMINI_MODEL`: `gemini-1.5-flash`
   - `DATABASE_URL`: Your pooled Neon connection string (if using cloud database)
   - `DIRECT_URL`: Your direct Neon connection string
4. Ensure the variables are enabled for **Production**, **Preview**, and **Development**.

### Step 3: Verify Build Command
The root `package.json` build command includes Prisma client generation:
```json
"build": "prisma generate && next build"
```
This ensures the `ChatSession` model is generated automatically during Vercel's CI build pipeline.

---

## 7. Verification & Testing

Run these verification commands locally:
```bash
# 1. Check TypeScript types strictly
npx tsc --noEmit

# 2. Check ESLint code quality
npm run lint

# 3. Test production bundle build
npm run build
```

To test the chatbot API endpoint manually via PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/assistant/chat" -Method POST -ContentType "application/json" -Body '{"messages":[{"role":"user","content":"मेरी टमाटर की फसल में पत्तों पर भूरे छल्ले बन रहे हैं, क्या उपाय करें?"}],"language":"hi"}'
```
