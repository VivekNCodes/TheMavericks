import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { generateChatbotResponse } from "@/features/chatbot/services/gemini-service";
import { SupportedLanguage } from "@/i18n/translations";

// In-memory sliding-window rate limiter (25 requests per minute per IP)
interface RateLimitBucket {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitBucket>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 25;

  const bucket = rateLimitMap.get(ip);
  if (!bucket || now > bucket.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (bucket.count >= maxRequests) {
    return false;
  }

  bucket.count += 1;
  return true;
}

// Sanitize user inputs to prevent PII exposure (e.g. 10-digit phone numbers)
function sanitizePromptText(text: string): string {
  // Mask Indian phone numbers: e.g. 9876543210
  const phoneMasked = text.replace(/(\+91[\-\s]?)?[6-9]\d{9}/g, "[PHONE REMOVED]");
  // Mask email addresses
  const emailMasked = phoneMasked.replace(/[\w.-]+@[\w.-]+\.\w+/g, "[EMAIL REMOVED]");
  return emailMasked.trim();
}

export async function POST(request: NextRequest) {
  // 1. IP Rate Limiting Check
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  if (!checkRateLimit(ip)) {
    return errorResponse(
      "Rate limit exceeded. Please wait a minute before sending another question.",
      "RATE_LIMIT_EXCEEDED",
      429
    );
  }

  try {
    const body = await request.json();
    const { messages, language = "en", farmerLocation = "Jaipur, Rajasthan" } = body;

    // 2. Request Payload Validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return errorResponse("Invalid message payload", "BAD_REQUEST", 400);
    }

    if (messages.length > 15) {
      return errorResponse("Conversation history too long. Please clear chat.", "PAYLOAD_TOO_LARGE", 400);
    }

    const validLangs: SupportedLanguage[] = ["en", "hi", "mr", "pa"];
    const targetLang: SupportedLanguage = validLangs.includes(language) ? language : "en";

    // Validate and sanitize messages
    const sanitizedMessages: Array<{ role: "user" | "assistant"; content: string }> = [];
    for (const msg of messages) {
      if (!msg.content || typeof msg.content !== "string") continue;
      if (msg.content.length > 1200) {
        return errorResponse(
          "Message exceeds maximum allowed length of 1200 characters.",
          "BAD_REQUEST",
          400
        );
      }
      sanitizedMessages.push({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: sanitizePromptText(msg.content),
      });
    }

    if (sanitizedMessages.length === 0) {
      return errorResponse("No valid messages found in request.", "BAD_REQUEST", 400);
    }

    // 3. Generate Multilingual Grounded Gemini Response
    const responseData = await generateChatbotResponse(
      sanitizedMessages,
      targetLang,
      farmerLocation
    );

    return successResponse(responseData);
  } catch (err) {
    console.error("Chatbot API server error:", err);
    return errorResponse(
      "An unexpected error occurred while processing your request.",
      "INTERNAL_ERROR",
      500,
      err
    );
  }
}
