import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Server-Side Audio Transcription Endpoint for AgroSaathi
 *
 * Provides a resilient, high-accuracy speech-to-text pipeline using Google Gemini
 * (Primary: gemini-3.5-transcribe with SMART mode, Fallback: gemini-3.5-flash multimodal STT)
 * with domain-specific biasing for Indian agricultural terms, crops, diseases, and languages.
 */

interface GeminiCandidatePart {
  text?: string;
  audioTranscription?: {
    text?: string;
  };
}

interface GeminiCandidate {
  content?: {
    parts?: GeminiCandidatePart[];
    role?: string;
  };
  finishReason?: string;
  index?: number;
}

interface GeminiGenerateContentResponse {
  candidates?: GeminiCandidate[];
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_CONTENT_TYPE",
          message: "Request must be multipart/form-data with an audio recording.",
        },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob | File | null;
    const languageHint = ((formData.get("language") as string) || "en").toLowerCase();

    if (!audioFile) {
      return NextResponse.json(
        {
          success: false,
          error: "MISSING_AUDIO",
          message: "No audio recording was provided in the request.",
        },
        { status: 400 }
      );
    }

    // Enforce 12MB limit (sufficient for multiple minutes of voice input)
    if (audioFile.size > 12 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: "PAYLOAD_TOO_LARGE",
          message: "Audio recording exceeds maximum allowed size (12MB). Please record a shorter message.",
        },
        { status: 413 }
      );
    }

    // If audio is practically empty (< 400 bytes indicates an empty container with no speech frames)
    if (audioFile.size < 400) {
      return NextResponse.json({
        success: true,
        text: "",
        engine: "gemini-audio",
        message: "No audio captured. Please speak closer to your microphone.",
      });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString("base64");

    // Standardize MIME type for Gemini API
    let rawMime = audioFile.type || "audio/webm";
    if (rawMime.includes(";")) {
      rawMime = rawMime.split(";")[0].trim();
    }
    const validMimes = [
      "audio/webm",
      "audio/wav",
      "audio/wave",
      "audio/x-wav",
      "audio/mp4",
      "audio/ogg",
      "audio/aac",
      "audio/mpeg",
      "audio/mp3",
    ];
    const mimeType = validMimes.includes(rawMime) ? rawMime : "audio/webm";

    const apiKey = process.env.GEMINI_API_KEY;

    // If Gemini API Key is missing, give a clear, informative diagnostic response
    if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
      return NextResponse.json(
        {
          success: false,
          error: "MISSING_GEMINI_API_KEY",
          message:
            "AI speech transcription requires GEMINI_API_KEY to be configured in Vercel or .env.local. Please type your message.",
        },
        { status: 200 }
      );
    }

    // Resolve model name and sanitize deprecated identifiers (e.g. 1.5, 2.0)
    let configuredModel =
      process.env.GEMINI_TRANSCRIBE_MODEL ||
      process.env.GEMINI_MODEL ||
      "gemini-3.5-transcribe";

    if (
      configuredModel === "gemini-1.5-flash" ||
      configuredModel.includes("1.5") ||
      configuredModel === "gemini-2.0-flash"
    ) {
      configuredModel = "gemini-3.5-transcribe";
    }

    const languageInstruction =
      languageHint === "hi"
        ? "Hindi (output in clean Devanagari script). E.g., मेरी गेहूं की फसल, यूरिया का छिड़काव, टमाटर का झुलसा रोग."
        : languageHint === "mr"
        ? "Marathi (output in Devanagari script)."
        : languageHint === "pa"
        ? "Punjabi (output in Gurmukhi script)."
        : "English (or mixed Indian English/Hinglish as spoken).";

    const promptText = `You are a specialized speech-to-text audio transcriber for AgroSaathi, an Indian agricultural advisory assistant.
Transcribe the speech in this audio recording with utmost precision.

Context & Rules:
1. Expected Language: ${languageInstruction}
2. Accurately transcribe agricultural terminology:
   - Crops: Wheat, Paddy / Rice, Mustard, Cotton, Maize, Gram / Chana, Sugarcane, Tomato, Potato, Onion.
   - Diseases: Blight (झुलसा), Blast, Rust (गेरुआ), Powdery Mildew, Leaf Curl, Wilt (उकठा).
   - Fertilizers & Chemicals: Urea, DAP, NPK, MOP, Zinc Sulphate, Trichoderma, Neem Oil, Mancozeb, Chlorpyrifos.
   - Farming terms: Sowing, Irrigation, Harvest, Mandi Bhav, MSP, KVK, PM-Kisan.
3. CRITICAL RULE: Output ONLY the verbatim transcribed words spoken by the user. Do NOT add quotation marks, explanations, notes, punctuation markup, or conversational filler.
4. If the recording is completely silent, background static, or unintelligible noise with no human speech, output exactly: EMPTY_AUDIO`;

    let transcribedText = "";
    let usedModel = configuredModel;

    // --- STRATEGY 1: Dedicated Gemini 3.5 Transcribe model ---
    if (configuredModel === "gemini-3.5-transcribe") {
      try {
        const transcribeUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-transcribe:generateContent`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        const res = await fetch(transcribeUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inlineData: {
                      mimeType,
                      data: base64Audio,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              audioTranscriptionConfig: {
                mode: "SMART",
              },
            },
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data: GeminiGenerateContentResponse = await res.json();
          const part = data?.candidates?.[0]?.content?.parts?.[0];
          transcribedText = (part?.audioTranscription?.text || part?.text || "").trim();
        } else {
          const errStatus = res.status;
          console.warn(`gemini-3.5-transcribe returned HTTP ${errStatus}, attempting fallback to gemini-3.5-flash...`);
        }
      } catch (transcribeErr) {
        console.warn("gemini-3.5-transcribe connection issue, falling back to gemini-3.5-flash:", transcribeErr);
      }
    }

    // --- STRATEGY 2: Multimodal Gemini 3.5 Flash fallback or explicit model ---
    if (!transcribedText) {
      usedModel = "gemini-3.5-flash";
      const flashUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 14000);

      const res = await fetch(flashUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: base64Audio,
                  },
                },
                { text: promptText },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 350,
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data: GeminiGenerateContentResponse = await res.json();
        const part = data?.candidates?.[0]?.content?.parts?.[0];
        transcribedText = (part?.audioTranscription?.text || part?.text || "").trim();
      } else {
        const errStatus = res.status;
        const errBody = await res.text().catch(() => "");
        console.error(`Gemini audio transcription fallback error (HTTP ${errStatus}):`, errBody.slice(0, 300));

        if (errStatus === 429) {
          return NextResponse.json(
            {
              success: false,
              error: "RATE_LIMITED",
              message: "Gemini transcription quota temporarily exceeded. Please type your message.",
            },
            { status: 429 }
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: "UPSTREAM_SERVICE_ERROR",
            message: "AI transcription service temporarily unavailable. Please type your message.",
          },
          { status: 502 }
        );
      }
    }

    // Post-process transcribed text (strip empty markers and stray quotes)
    if (
      transcribedText === "EMPTY_AUDIO" ||
      transcribedText.toLowerCase() === "empty_audio." ||
      transcribedText === '""' ||
      transcribedText === "''"
    ) {
      transcribedText = "";
    } else {
      transcribedText = transcribedText.replace(/^["'`]+|["'`]+$/g, "").trim();
    }

    return NextResponse.json({
      success: true,
      text: transcribedText,
      engine: "gemini-audio",
      model: usedModel,
      language: languageHint,
      message:
        transcribedText.length === 0
          ? "No clear speech detected in recording. Please try speaking again or type your message."
          : undefined,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json(
        {
          success: false,
          error: "TIMEOUT",
          message: "Speech transcription timed out. Please try speaking again or type your question.",
        },
        { status: 504 }
      );
    }

    console.error("Transcription endpoint unexpected error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred during audio transcription. Please type your message.",
      },
      { status: 500 }
    );
  }
}
