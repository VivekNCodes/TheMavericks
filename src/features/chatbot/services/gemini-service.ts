import { SupportedLanguage } from "@/i18n/translations";
import { ChatMessage, ChatResponsePayload } from "../types";
import { retrieveAgriculturalGrounding } from "./agricultural-knowledge";

/**
 * Heuristic detector for Indian regional scripts and languages.
 */
export function detectIndianLanguage(
  text: string,
  preferredLang: SupportedLanguage = "en"
): SupportedLanguage {
  if (!text) return preferredLang;

  // Gurmukhi Unicode block (\u0A00 - \u0A7F) -> Punjabi
  if (/[\u0A00-\u0A7F]/.test(text)) {
    return "pa";
  }

  // Devanagari Unicode block (\u0900 - \u097F)
  if (/[\u0900-\u097F]/.test(text)) {
    const marathiKeywords = [
      "आहे", "नाही", "पिकाला", "पिकासाठी", "शेती", "शेतकरी", "पाऊस", "लागवड",
      "खत", "करावे", "द्यावे", "कधी", "कसे", "कांदा", "टोमॅटो", "गहू", "बटाटा"
    ];
    const isMarathi = marathiKeywords.some((word) => text.includes(word));
    if (isMarathi || preferredLang === "mr") {
      return "mr";
    }
    return "hi";
  }

  return preferredLang;
}

/**
 * Deterministic fallback generator when GEMINI_API_KEY is not set or network fails.
 * Synthesizes grounded, accurate answers from KrishiSetu's validated agricultural data.
 */
function generateDeterministicFallbackReply(
  userQuery: string,
  groundingText: string,
  lang: SupportedLanguage
): string {
  const queryLower = userQuery.toLowerCase();

  if (lang === "hi") {
    return `नमस्ते किसान साथी! KrishiSetu AI के सत्यापित कृषि ज्ञानकोष के अनुसार:

${groundingText.split("\n").slice(0, 8).join("\n")}

सलाह: यह जानकारी ICAR (भारतीय कृषि अनुसंधान परिषद) और ओपन-मौसम (Open-Meteo) के प्रमाणित आंकड़ों पर आधारित है। रासायनिक उपचार या खाद की अंतिम मात्रा के लिए अपने नजदीकी कृषि विज्ञान केंद्र (KVK) या ग्राम कृषि अधिकारी से संपर्क करें।`;
  }

  if (lang === "mr") {
    return `नमस्कार शेतकरी मित्रा! कृषीसेतू AI च्या प्रमाणित शेती ज्ञानकोशानुसार:

${groundingText.split("\n").slice(0, 8).join("\n")}

सल्ला: ही माहिती ICAR आणि हवामान मानकांवर आधारित आहे. कीटकनाशके किंवा खतांच्या अचूक मात्रेसाठी आपल्या स्थानिक कृषी विज्ञान केंद्र (KVK) चा सल्ला घ्यावा.`;
  }

  if (lang === "pa") {
    return `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! ਕ੍ਰਿਸ਼ੀਸੇਤੂ ਦੇ ਪ੍ਰਮਾਣਿਤ ਖੇਤੀਬਾੜੀ ਗਿਆਨ ਅਨੁਸਾਰ:

${groundingText.split("\n").slice(0, 8).join("\n")}

ਸਲਾਹ: ਇਹ ਜਾਣਕਾਰੀ ICAR ਅਤੇ ਮੌਸਮ ਵਿਭਾਗ ਦੇ ਤੱਥਾਂ 'ਤੇ ਅਧਾਰਿਤ ਹੈ। ਖ਼ਾਦ ਜਾਂ ਦਵਾਈ ਦੀ ਸਹੀ ਮਾਤਰਾ ਲਈ ਆਪਣੇ ਨੇੜਲੇ ਕ੍ਰਿਸ਼ੀ ਵਿਗਿਆਨ ਕੇਂਦਰ (KVK) ਨਾਲ ਸੰਪਰਕ ਕਰੋ।`;
  }

  return `Hello Farmer! Based on KrishiSetu AI's verified agronomic knowledge base:

${groundingText.split("\n").slice(0, 8).join("\n")}

Advisory Note: This guidance is based on verified ICAR and Open-Meteo agronomic research. For field-specific chemical sprays or diagnosis, please consult your nearest Krishi Vigyan Kendra (KVK) or local agricultural officer.`;
}

/**
 * Builds the specialized system instruction prompt for Gemini.
 */
function buildSystemInstructions(
  targetLanguage: SupportedLanguage,
  groundingContext: string
): string {
  const languageNames: Record<SupportedLanguage, string> = {
    en: "English",
    hi: "Hindi (हिन्दी)",
    mr: "Marathi (मराठी)",
    pa: "Punjabi (ਪੰਜਾਬੀ)",
  };

  return `You are "KrishiSetu AI Sahayak" (कृषिसेतु सहायक), an empathetic, knowledgeable, and humble agricultural AI assistant for Indian farmers.

CORE OPERATIONAL RULES:
1. Explanatory Assistant Role: You are an explanatory advisor, NOT an authoritative agronomist. Always acknowledge uncertainty and identify when field conditions require on-site inspection.
2. Zero Fabrication Policy: NEVER invent or hallucinate pesticide doses, unapproved chemical brands, false weather numbers, or fake fertilizer quantities. If you do not have exact verified data, clearly say so.
3. Grounding Priority: Prioritize and ground your answers in the provided verified KrishiSetu agronomic knowledge base below.
4. Integrated Pest Management (IPM): Always promote cultural sanitation, resistant varieties, bio-inoculants (Trichoderma, Neem formulations), and balanced nutrition before mentioning synthetic chemicals.
5. Language & Tone: Respond directly in ${languageNames[targetLanguage]}. Use warm, respectful, practical language that Indian farmers understand. If the user writes in Hindi, Marathi, or Punjabi, reply in that script natively.
6. Safety Disclaimer: Whenever advising on plant diseases, severe pests, or chemical usage, include a brief recommendation to verify with their local Krishi Vigyan Kendra (KVK) or State Agricultural University.

==============================
GROUNDED KRISHISETU KNOWLEDGE BASE CONTEXT:
${groundingContext}
==============================`;
}

/**
 * Call Google Gemini API (Free tier supported model: gemini-1.5-flash)
 */
export async function generateChatbotResponse(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  selectedLanguage: SupportedLanguage,
  farmerLocation = "Jaipur, Rajasthan"
): Promise<ChatResponsePayload> {
  const lastUserMessage = messages[messages.length - 1]?.content || "";
  const detectedLang = detectIndianLanguage(lastUserMessage, selectedLanguage);

  // 1. Retrieve verified agronomic grounding context
  const { groundedText, citations } = await retrieveAgriculturalGrounding(
    lastUserMessage,
    farmerLocation
  );

  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  // 2. If no API key configured, use deterministic grounded engine
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
    const fallbackReply = generateDeterministicFallbackReply(
      lastUserMessage,
      groundedText,
      detectedLang
    );

    return {
      reply: fallbackReply,
      language: detectedLang,
      detectedLanguage: detectedLang,
      groundings: citations,
      mode: "knowledge-base",
    };
  }

  // 3. Call Google Gemini API via official REST v1beta endpoint
  try {
    const systemPrompt = buildSystemInstructions(detectedLang, groundedText);

    // Map conversation history to Gemini contents format
    const contents = messages.slice(-8).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents,
        generationConfig: {
          temperature: 0.2, // Low temperature for high factual adherence
          topP: 0.8,
          maxOutputTokens: 600,
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (replyText && replyText.length > 5) {
        return {
          reply: replyText,
          language: detectedLang,
          detectedLanguage: detectedLang,
          groundings: citations,
          mode: "gemini-live",
        };
      }
    } else {
      const errText = await response.text();
      console.warn(`Gemini API error (Status ${response.status}):`, errText);
    }
  } catch (err) {
    console.warn("Gemini live call timed out or failed, utilizing grounded knowledge fallback:", err);
  }

  // Fallback if Gemini request encountered rate limits or timeout
  const fallbackReply = generateDeterministicFallbackReply(
    lastUserMessage,
    groundedText,
    detectedLang
  );

  return {
    reply: fallbackReply,
    language: detectedLang,
    detectedLanguage: detectedLang,
    groundings: citations,
    mode: "knowledge-base",
  };
}
