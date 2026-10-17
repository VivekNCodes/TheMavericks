# KrishiSetu AI (कृषि सेतु) - Full Technical Approach & Infrastructure Specification

> **Document Classification**: Non-Executable & Non-Deployable Technical Architecture Blueprint  
> **Platform**: KrishiSetu AI (TheMavericks)  
> **Target Audience**: Solution Architects, Technical Evaluators, Agronomists, and Engineering Leads  
> **Repository**: [https://github.com/VivekNCodes/TheMavericks.git](https://github.com/VivekNCodes/TheMavericks.git)  
> **Last Updated**: October 2026  

---

## 1. Executive Technical Summary

**KrishiSetu AI** is a modular, multi-tenant agricultural intelligence and digital commerce platform designed specifically for the Indian agricultural ecosystem. It bridges the critical divide between cutting-edge computational agronomy (meteorological modelling, soil hydrology, and visual pathology) and hyper-local farmer decision-making across disparate Indian states, agro-climatic zones, and vernacular languages.

The platform is engineered as a **Modern Modular Monolith** on **Next.js 14 (App Router)**, **TypeScript 5 (Strict Mode)**, **Tailwind CSS**, and **Neon Serverless PostgreSQL (Prisma ORM)**. It integrates external computational APIs (Open-Meteo Weather models and Google Gemini 1.5 Flash LLM) through strictly sandboxed, authenticated server-side route handlers that enforce data honesty, PII redaction, and offline-first fallback guarantees.

```
+----------------------------------------------------------------------------------------------------+
|                                    KRISHISETU AI ECOSYSTEM                                        |
+----------------------------------------------------------------------------------------------------+
|   Farmer Inputs        | Multilingual UI (EN, HI, MR, PA) | Responsive PWA / Mobile Browser        |
+------------------------+----------------------------------+----------------------------------------+
|   Core AI Modules      | 1. Crop Growing Planner (FAO-56) | 4. Smart Irrigation Advisor            |
|                        | 2. AI Sahayak Chatbot (Gemini)   | 5. Mandi Price Intelligence            |
|                        | 3. Crop Disease Vision Detection | 6. Direct Farmer Marketplace           |
+------------------------+----------------------------------+----------------------------------------+
|   Data & Persistence   | Neon Serverless PostgreSQL (PgBouncer) + Prisma + Client LocalStorage     |
+------------------------+----------------------------------+----------------------------------------+
|   Hosting & Edge Infra | Vercel Global Edge Network / Node.js Serverless Functions                  |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. End-to-End System Infrastructure Topology

The system operates across three decoupled infrastructure tiers: Client/Edge Presentation, Serverless Next.js Compute, and Distributed Backend/Cloud Services.

```mermaid
flowchart TB
    subgraph ClientTier ["Client Presentation Tier (Browser / PWA)"]
        UI["Next.js React 18 UI / RSC & Client Hydration"]
        LangContext["Language Provider (EN / HI / MR / PA)"]
        LocalStorage["Browser LocalStorage (Offline Cache)"]
        UI --> LangContext
        UI <--> LocalStorage
    end

    subgraph EdgeComputeTier ["Serverless Compute Tier (Vercel Edge & Node Runtimes)"]
        Router["Next.js 14 App Router (/src/app)"]
        
        subgraph ServerAPIRoutes ["Server-Side Route Handlers (/api)"]
            ChatRoute["/api/assistant/chat\n(Rate Limiter, PII Redaction)"]
            SessionsRoute["/api/assistant/sessions\n(Chat Persistence)"]
            PlannerRoute["/api/crop-planner/plan\n(FAO-56 Water Budget)"]
            WeatherRoute["/api/crop-planner/weather\n(Forecast Proxy)"]
            HealthRoute["/api/health\n(Liveness & Diagnostics)"]
        end
        
        Router --> ServerAPIRoutes
    end

    subgraph ServiceLayerTier ["Local Agronomic Intelligence Engines (/src/lib & /src/features)"]
        FAO56Engine["FAO-56 Penman-Monteith Evapotranspiration Engine"]
        ICARKnowledge["ICAR Package of Practices Database (10 Crops)"]
        SoilEngine["Indian Soil Hydrology Engine (6 Soil Orders)"]
        PathologyEngine["Visual Foliar Pathology Knowledge Base"]
    end

    subgraph CloudAPITier ["External Upstream Cloud Services"]
        GeminiAPI["Google Gemini 1.5 Flash (Google AI Studio REST)"]
        OpenMeteo["Open-Meteo Global Meteorological API"]
        NeonDB["Neon Serverless PostgreSQL (AWS us-east-2 / PgBouncer)"]
    end

    UI -->|"HTTPS / JSON"| Router
    ChatRoute -->|"2-Stage Retrieval"| ICARKnowledge
    ChatRoute -->|"Live Telemetry"| OpenMeteo
    ChatRoute -->|"Sanitized Prompts"| GeminiAPI
    PlannerRoute -->|"Soil & Crop Params"| FAO56Engine
    PlannerRoute -->|"Historical & Forecast"| OpenMeteo
    PlannerRoute --> SoilEngine
    PlannerRoute --> ICARKnowledge
    SessionsRoute -->|"Prisma Client"| NeonDB
```

---

## 3. Technology Stack & Infrastructure Choices

| Infrastructure Dimension | Technology Selection | Version / Specification | Rationale & Trade-off Analysis |
|---|---|---|---|
| **Framework** | Next.js App Router | `14.2.15` | Hybrid Server Components (`RSC`) drastically minimize JavaScript bundle size for low-bandwidth 3G/4G rural networks. |
| **Language** | TypeScript (Strict) | `5.6.3` | Absolute type safety with `noImplicitAny: true`. Guarantees robust domain models across agronomic computations. |
| **Styling & Tokens** | Tailwind CSS + PostCSS | `3.4.14` | High-performance atomic utility CSS with custom `krishi-*` color tokens. Zero runtime CSS overhead. |
| **Database** | Neon PostgreSQL | Serverless v16 | Fully managed serverless PostgreSQL with auto-scaling to zero and built-in connection pooling (`PgBouncer`). |
| **ORM & Migrations** | Prisma ORM | `5.21.1` | Type-safe query building, declarative schema definition (`prisma/schema.prisma`), and automatic type generation. |
| **Language Model (LLM)** | Google Gemini 1.5 Flash | REST v1beta | High-speed, context-window efficiency on the Free Tier (15 RPM, 1M TPM, 1500 RPD). Encapsulated via serverless fetch. |
| **Weather Engine** | Open-Meteo API | CC BY 4.0 Open Model | High-precision agricultural meteorological forecast without requiring paid API keys or exposing billing credentials. |
| **Icons & Design Assets** | Lucide React | `0.453.0` | Accessible, tree-shakeable SVG icons representing Indian agricultural concepts and equipment. |
| **Deployment Platform** | Vercel Edge / Serverless | Node.js 20.x runtime | Instant global CDN caching, zero cold-start edge routing, automatic SSL, and preview environments. |

---

## 4. Multi-Agent & Contributor Boundary Protocol

To facilitate parallel multi-developer engineering without merge conflicts or architectural divergence, the codebase enforces an immutable ownership boundary documented in [`AGENTS.md`](file:///m:/Projects/HackShift/AGENTS.md):

```
                                  [INTEGRATION LEAD]
                             Core Architecture & Shared Shell
               (src/app/, src/components/, src/lib/, src/config/, prisma/)
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        ▼                               ▼                               ▼
  [MEMBER 2]                      [MEMBER 3]                      [MEMBER 4]
  Mandi Price Intelligence        Smart Irrigation Advisor        Farmer Marketplace
  (src/features/mandi-prices/)    (src/features/irrigation/)      (src/features/marketplace/)
```

### Protocol Invariants:
1. **Module Isolation**: Feature members develop strictly within their respective `/src/features/<module>/` directory.
2. **Shared Layout Protection**: Teammates are restricted from modifying `src/app/layout.tsx`, `src/components/layout/AppShell.tsx`, or global Tailwind configurations.
3. **Shared Contract RFC**: If a feature requires changes to global database tables or shared primitives, the modification must be proposed to the Integration Lead via local interface extensions before core changes are accepted.

---

## 5. Frontend Engineering & Design System

### 5.1. Server Component vs. Client Component Boundary
To guarantee sub-second rendering on 4G smartphone browsers in rural regions:
- **Server Components (`RSC`)**: Used for page wrappers, static banners, metadata injectors, and initial HTML construction.
- **Client Components (`'use client'`)**: Sandboxed strictly at interactive touchpoints:
  - Form state machines (Crop Planner wizard, chat input).
  - Browser API bridges (`localStorage` persistence, audio, geolocation).
  - UI toggles (mobile hamburger drawer, language selection popup, modal overlays).

### 5.2. Design System Tokens
The UI is styled using custom semantic color palettes defined in [`tailwind.config.ts`](file:///m:/Projects/HackShift/tailwind.config.ts) and [`src/constants/theme.ts`](file:///m:/Projects/HackShift/src/constants/theme.ts):

| Token Family | Color Hex Range | Semantic Meaning in Indian Agriculture |
|---|---|---|
| `krishi-50` to `krishi-950` | `#F0FDF4` to `#052e16` | Foliage health, ICAR standards, verified producers, optimal status. |
| `surface-*` | `#FFFFFF` to `#E2E8E2` | Clean, high-contrast, glare-resistant surfaces for outdoor sunlight reading. |
| `mandi-50` to `mandi-700` | `#FFFBEB` to `#B45309` | APMC wholesale rates, price fluctuations, wheat/mustard harvest tones. |
| `irrigation-50` to `irrigation-700` | `#F0F9FF` to `#0369A1` | Groundwater, rainfall, soil moisture, drip/sprinkler scheduling. |

---

## 6. Multilingual & Localization Architecture (i18n)

India's farming demographic spans varied linguistic backgrounds. KrishiSetu AI avoids third-party translation widgets that require heavy JavaScript runtimes or break on offline connections.

```
                                [Farmer User]
                                      │
                         ┌────────────┴────────────┐
                         ▼                         ▼
             [Manual Language Switcher]    [Unicode Script Detection]
                         │                         │
                         └────────────┬────────────┘
                                      ▼
                        [LanguageContext State Engine]
                                      │
        ┌──────────────┬──────────────┴──────────────┬──────────────┐
        ▼              ▼                             ▼              ▼
     English        Hindi                         Marathi        Punjabi
     (`en`)         (`hi`)                        (`mr`)         (`pa`)
   Universal      National Reach               Deccan & West  Breadbasket & North
```

### Key Technical Implementation Details:
1. **Context Provider**: [`src/context/LanguageContext.tsx`](file:///m:/Projects/HackShift/src/context/LanguageContext.tsx) synchronizes language selection with `localStorage` and exposes a strictly typed translation function `t(key: TranslationKey)`.
2. **Deterministic Fallback**: If a key is missing in a regional dialect, the dictionary cascades gracefully to English without rendering empty blocks.
3. **Natural Script Detection**:
   - Gurmukhi Unicode block (`\u0A00-\u0A7F`) maps directly to Punjabi (`pa`).
   - Devanagari Unicode block (`\u0900-\u097F`) differentiates Marathi (`mr`) from Hindi (`hi`) through grammatical marker tokens (`आहे`, `नाही`, `शेतकरी`, `पिकाला`).

---

## 7. Deep Dive: Architectural Modules

### 7.1. Module 1: KrishiSetu AI Sahayak (Multilingual Conversational Chatbot)
The conversational chatbot acts as an explanatory agricultural advisor rather than an authoritative dispenser of chemical toxins.

```mermaid
sequenceDiagram
    autonumber
    actor Farmer as Farmer (Browser/Mobile)
    participant ChatUI as ChatInterface.tsx
    participant Route as /api/assistant/chat
    participant Retriever as AgriculturalKnowledge.ts
    participant WeatherAPI as Open-Meteo REST
    participant Gemini as Google Gemini 1.5 Flash
    participant DB as Neon PostgreSQL (ChatSession)

    Farmer->>ChatUI: Types inquiry ("टमाटर में अगेती झुलसा का क्या करें?")
    ChatUI->>Route: POST { messages, language: "hi", location: "Jaipur" }
    Route->>Route: Validate length (<1200 chars) & Rate Limit (25 req/min)
    Route->>Route: PII Sanitization (Redact mobile numbers / emails)
    Route->>Retriever: Extract Agronomic Entities (Tomato, Early Blight)
    Retriever-->>Route: ICAR Package of Practices Data
    Route->>WeatherAPI: Fetch District Meteorological Conditions
    WeatherAPI-->>Route: Temp: 28C, Humidity: 68%, Rain Prob: 15%
    Route->>Gemini: Dispatch System Prompt + Grounded Context + History
    Gemini-->>Route: Grounded Natural Language Response
    Route-->>ChatUI: JSON { reply, groundings, detectedLang: "hi" }
    ChatUI->>Farmer: Render response with verified ICAR source pills
    ChatUI-)DB: Async Session Sync (/api/assistant/sessions)
```

#### Grounding & Safety Guardrails:
- **No Chemical Hallucination**: The prompt explicitly forbids the LLM from inventing pesticide doses or brand names.
- **Integrated Pest Management (IPM)**: Mandatory prioritization of cultural sanitation (removing infected foliage, adjusting plant spacing) and bio-controls (*Trichoderma*, Neem oil) before chemical intervention.
- **Mandatory KVK Escalation**: Any high-severity disease inquiry concludes with a recommendation to confirm diagnoses at the nearest Krishi Vigyan Kendra (KVK).

---

### 7.2. Module 2: Crop Growing Planner (FAO-56 Agrometeorological Engine)
The Crop Growing Planner translates high-level agricultural physics into day-by-day, actionable farmer cultivation schedules.

#### Mathematical Foundation:
1. **Crop Evapotranspiration ($ET_c$)**:
   $$\text{ET}_c = K_c \times \text{ET}_0$$
   Where $K_c$ is the FAO-56 crop coefficient calibrated to the plant phenological stage (Initial, Vegetative, Mid-Season, Maturity), and $\text{ET}_0$ is the reference evapotranspiration derived from Open-Meteo solar radiation, temperature, and wind speed.
2. **USDA-SCS Effective Precipitation ($P_{eff}$)**:
   $$P_{\text{eff}} = \begin{cases} 
   \frac{P_{\text{total}} \times (125 - 0.2 \times P_{\text{total}})}{125} & \text{if } P_{\text{total}} \le 250\text{ mm} \\
   125 + 0.1 \times P_{\text{total}} & \text{if } P_{\text{total}} > 250\text{ mm}
   \end{cases}$$
3. **Net & Gross Irrigation Demand**:
   $$\text{Net Irrigation} = \max(0, \text{ET}_c - P_{\text{eff}})$$
   $$\text{Gross Irrigation} = \frac{\text{Net Irrigation}}{\text{Application Efficiency } (\eta)}$$
   Where $\eta = 0.90$ for Drip, $0.75$ for Sprinkler, and $0.60$ for Surface/Flood.

---

### 7.3. Module 3: Crop Disease Detection (Visual Pathology Architecture)
Designed for instant leaf affliction diagnosis via image upload or mobile camera capture.

- **Inference Pipeline**: Sandboxed client drag-and-drop uploader supporting JPEG, PNG, and WEBP leaf photographs.
- **Edge Architecture Consideration**: The application strictly separates UI from heavy neural networks. Heavy multi-gigabyte models are **never bundled** into the Next.js client bundle. Inference is mediated through cloud endpoints or lightweight quantized ONNX/TFLite models.
- **Actionable Remediation**: Every detected affliction outputs confidence metrics, pathogen taxonomy, organic treatments (Neem extracts, bio-fungicides), and mandatory spray precautions.

---

### 7.4. Module 4: Mandi Price Intelligence (APMC Market Discovery)
Eliminates information asymmetry for regional wholesale markets.

- **Data Model**: Captures minimum, modal, and maximum prices in INR per Quintal along with arrival volumes in metric tonnes across APMCs.
- **Analytical Features**:
  - Distance-weighted price comparisons between neighboring mandis.
  - Interactive price trend visualizations (7 Days, 1 Month, 3 Months, 6 Months).
  - Arrival volume tracking to anticipate supply gluts and price drops.

---

### 7.5. Module 5: Smart Irrigation Advisor (Soil Hydrology)
Translates 5-day weather forecasts into immediate field watering decisions.

- **Workflow**: Guided 4-step wizard capturing crop type, growth stage, soil order, and days since last irrigation.
- **Soil Hydrology Matrix**: Calibrated to 6 primary Indian soil types: Alluvial, Black Cotton, Red & Yellow, Laterite, Desert Sandy, and Mountain Loam.
- **Action Recommendations**: Categorized urgency levels (`NO_ACTION_NEEDED`, `LOW`, `MODERATE`, `URGENT`) coupled with soil moisture validation guidance.

---

### 7.6. Module 6: Direct Farmer Marketplace (Agri-Commerce Gateway)
A direct digital trade avenue connecting farmers to retail and wholesale buyers.

- **Listing Management**: Farmers create listings specifying crop variety, harvested quantity (kg), target price per quintal, quality grade, and real photographs.
- **Inquiry Matching**: Buyers submit digital purchase inquiries with proposed pricing, facilitating peer-to-peer negotiation without commission-charging intermediaries.

---

## 8. API Design & Communication Protocols

All server-side route handlers follow a standardized RESTful envelope format:

### Success Response Contract (`ApiResponse<T>`):
```json
{
  "success": true,
  "data": {
    "reply": "फसल के लिए अनुशंसित सुझाव...",
    "groundings": [
      "ICAR Package of Practices",
      "Live Open-Meteo Weather"
    ],
    "mode": "gemini-live"
  },
  "timestamp": "2026-10-17T18:30:00.000Z"
}
```

### Error Response Contract:
```json
{
  "success": false,
  "error": "Rate limit exceeded. Please wait 45 seconds before asking another question.",
  "timestamp": "2026-10-17T18:30:00.000Z"
}
```

### Route Registry:
| Endpoint | Method | Functionality | Auth / Security |
|---|---|---|---|
| `/api/assistant/chat` | `POST` | Dispatches multilingual query to Gemini or offline engine | IP Sliding Window Rate Limit, PII Scrubbing |
| `/api/assistant/sessions` | `GET` / `POST` / `DELETE` | Retrieves, synchronizes, or clears farmer chat sessions | User ID / Local Storage Fallback |
| `/api/crop-planner/plan` | `POST` | Computes FAO-56 crop calendar and water budget | Validated Agronomic Parameters |
| `/api/crop-planner/weather` | `GET` | Proxies Open-Meteo 7-day meteorological forecasts | Geocoding Sanitization, Public CC BY 4.0 |
| `/api/health` | `GET` | Health check & system diagnostics | Public Liveness Probe |

---

## 9. Database & Persistence Architecture

The database layer utilizes **Neon Serverless PostgreSQL** managed via **Prisma ORM**.

```mermaid
erDiagram
    User ||--o{ CropProfile : owns
    User ||--o{ MarketplaceListing : creates
    User ||--o{ MarketplaceInquiry : initiates
    User ||--o{ CropPlan : saves
    User ||--o{ ChatSession : maintains

    CropProfile ||--o{ DiseaseLog : logs
    CropProfile ||--o{ IrrigationLog : logs
    MarketplaceListing ||--o{ MarketplaceInquiry : receives

    User {
        string id PK
        string phone UK
        string fullName
        enum role
        string state
        string district
    }

    CropProfile {
        string id PK
        string cropName
        float acreage
        enum growthStage
    }

    CropPlan {
        string id PK
        string cropName
        datetime sowingDate
        float landArea
        string soilType
        json planData
    }

    ChatSession {
        string id PK
        string title
        string language
        json messages
    }

    MarketplaceListing {
        string id PK
        string cropName
        float quantityKg
        float pricePerQuintal
        enum status
    }
```

### Connection Strategy:
- **Pooled URL (`DATABASE_URL`)**: Utilizes `pgbouncer=true` on port 6543 for stateless Vercel Serverless Function invocations. Prevents connection pool exhaustion.
- **Direct URL (`DIRECT_URL`)**: Uses direct port 5432 for CLI migrations and schema pushes (`prisma db push`).
- **Offline Degradation**: The database client utility [`src/lib/db.ts`](file:///m:/Projects/HackShift/src/lib/db.ts) verifies connectivity on boot. If the cloud database is unreachable or credentials are unconfigured, state operations seamlessly fall back to browser `localStorage`.

---

## 10. Security, Privacy & Compliance Architecture

1. **Zero Secret Leakage**:
   - Environment variables (`GEMINI_API_KEY`, `DATABASE_URL`) are strictly loaded on the server side.
   - The Next.js compiler ensures that variables lacking the `NEXT_PUBLIC_` prefix are excluded from the client-side JavaScript bundle.
2. **Farmer PII Protection**:
   - In accordance with rural data privacy principles, farmer phone numbers, national IDs, and exact land parcel coordinates are never forwarded to upstream LLMs.
   - Regular expressions scan and redact 10-digit Indian phone numbers (`[REDACTED_PHONE]`) and emails prior to external API dispatch.
3. **Denial of Service & Abuse Mitigation**:
   - Sliding-window in-memory rate limiting restricts each client IP to 25 requests per minute, preventing automated scrapers from exhausting free-tier quotas.
   - Payloads are restricted to 1,200 characters and 15 conversational turns.

---

## 11. Offline-First Resilience & Graceful Degradation Matrix

| Failure Mode | Standard Industry Failure | KrishiSetu AI Resilient Response |
|---|---|---|
| **`GEMINI_API_KEY` Absent or Depleted** | 500 Internal Server Error / Crashed UI | Switches automatically to `mode: "knowledge-base"` using the local ICAR agronomic database. |
| **No Internet / Spotty Rural 3G** | Blank screen / Fetch Error | Client `localStorage` hydrates previously calculated crop plans, saved mandis, and conversation history. |
| **Neon PostgreSQL Connection Drop** | Unhandled Database Rejection | Read/write operations fall back to client state; data is synchronized once connectivity resumes. |
| **Open-Meteo Forecast Unavailable** | Missing water budget calculation | Falls back to regional historical climate normal tables for the selected agro-climatic zone. |

---

## 12. Deployment Topology & DevOps Pipeline

The application is structured for zero-configuration, continuous deployment on the **Vercel Global Edge Network**:

```
GitHub Push (main branch)
        │
        ▼
Vercel CI/CD Build Pipeline
        │
        ├─► Step 1: Install Dependencies (npm ci)
        ├─► Step 2: Generate Prisma Client (npx prisma generate)
        ├─► Step 3: Compile TypeScript & Lint (tsc --noEmit, next lint)
        └─► Step 4: Next.js Production Build (next build)
        │
        ▼
Vercel Edge & Serverless Deployment
        │
        ├─► Static Assets (JS, CSS, SVGs) ──► Global Edge CDN (Anycast)
        └─► API Routes & Dynamic SSR       ──► Serverless Lambda (Node.js 20.x)
```

### Environment Configuration Checklist:
```env
# Core Application
NEXT_PUBLIC_APP_NAME="KrishiSetu AI"
NEXT_PUBLIC_APP_DESCRIPTION="Smart Farming, Brighter Futures"
NEXT_PUBLIC_APP_URL="https://the-mavericks.vercel.app"

# Database (Neon Serverless PostgreSQL)
DATABASE_URL="postgresql://user:pass@ep-endpoint-pooler.us-east-2.aws.neon.tech/krishisetu?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:pass@ep-endpoint.us-east-2.aws.neon.tech/krishisetu?sslmode=require"

# Agricultural AI Assistant (Google AI Studio Free Tier)
GEMINI_API_KEY="AIzaSy..."
GEMINI_MODEL="gemini-1.5-flash"
```

---

## 13. Quality Assurance & Verification Standards

To maintain production stability across multi-developer contributions, every code change must pass four sequential verification gates:

```bash
# Gate 1: Strict TypeScript Type Check (Zero implicit any, zero missing props)
npx tsc --noEmit

# Gate 2: Static Analysis & ESLint Conformance
npm run lint

# Gate 3: Production App Router Compilation & Tree-Shaking
npm run build

# Gate 4: Live HTTP API Route Smoke Testing
node -e "require('http').get('http://localhost:3000/api/health', (r) => console.log('STATUS:', r.statusCode))"
```

---

## 14. Conclusion & Architectural Readiness

The technical infrastructure of **KrishiSetu AI** establishes an enterprise-grade, highly resilient platform tailored to Indian agriculture. By combining the agility of Next.js 14 Server Components with scientific FAO-56 agrometeorology, Google Gemini 1.5 Flash conversational grounding, and strict offline-first resilience, the platform provides farmers with a dependable, cost-free digital partner for sustainable agricultural prosperity.
