import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Server-Side Audio Transcription Endpoint for AgroSaathi
 *
 * Provides a resilient speech-to-text fallback using Gemini 1.5 Flash multimodal audio understanding
 * when browser-native SpeechRecognition encounters network restrictions (e.g., Brave browser,
 * blocked Google Web Speech endpoints, strict firewalls, or unsupported browsers like Firefox).
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob | File | null;
    const languageHint = (formData.get("language") as string) || "en";

    if (!audioFile) {
      return NextResponse.json(
        {
          success: false,
          error: "MISSING_AUDIO",
          message: "No audio stream provided in the request.",
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
        message: "No audio content captured.",
      });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString("base64");

    // Standardize MIME type for Gemini
    let rawMime = audioFile.type || "audio/webm";
    if (rawMime.includes(";")) {
      rawMime = rawMime.split(";")[0].trim();
    }
    // Supported Gemini input audio formats: audio/webm, audio/wav, audio/mp4, audio/ogg, audio/aac, audio/mpeg
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
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    // If Gemini API Key is missing, give a clear, informative diagnostic response
    if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
      return NextResponse.json({
        success: false,
        error: "MISSING_GEMINI_API_KEY",
        message:
          "Browser speech recognition failed due to network/browser restriction, and server-side transcription requires GEMINI_API_KEY in .env.local. Please type your message or configure the key.",
      });
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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

    if (response.ok) {
      const data = await response.json();
      let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

      // Clean quotation wraps or empty markers
      if (
        rawText === "EMPTY_AUDIO" ||
        rawText.toLowerCase() === "empty_audio." ||
        rawText === '""' ||
        rawText === "''"
      ) {
        rawText = "";
      } else {
        // Strip leading/trailing quotes if Gemini added any
        rawText = rawText.replace(/^["'`]+|["'`]+$/g, "").trim();
      }

      return NextResponse.json({
        success: true,
        text: rawText,
        engine: "gemini-audio",
        language: languageHint,
      });
    }

    const errText = await response.text();
    console.warn(`Gemini audio transcription error (Status ${response.status}):`, errText);

    return NextResponse.json(
      {
        success: false,
        error: "GEMINI_TRANSCRIBE_FAILED",
        message:
          response.status === 429
            ? "Gemini transcription quota temporarily exceeded. Please type your message."
            : `AI speech transcription service error (${response.status}). Please type your message.`,
      },
      { status: 502 }
    );
  } catch (err: any) {
    if (err.name === "AbortError") {
      return NextResponse.json(
        {
          success: false,
          error: "TIMEOUT",
          message: "Speech transcription timed out. Please try speaking again or type your question.",
        },
        { status: 504 }
      );
    }

    console.error("Transcription endpoint error:", err);
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
