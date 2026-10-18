"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SupportedLanguage } from "@/i18n/translations";

/**
 * Clean text for speech synthesis to avoid speaking raw Markdown syntax, emojis, URLs, and code.
 */
export function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return "";

  let cleaned = rawText;
  // Remove markdown code blocks
  cleaned = cleaned.replace(/```[\s\S]*?```/g, "");
  cleaned = cleaned.replace(/`([^`]+)`/g, "$1");
  // Remove markdown headers
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, "");
  // Remove markdown links [title](url) -> title
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  // Remove raw URLs
  cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, "");
  // Remove bold and italics formatting ** * _
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, "$1");
  cleaned = cleaned.replace(/\*([^*]+)\*/g, "$1");
  cleaned = cleaned.replace(/_([^_]+)_/g, "$1");
  // Remove bullet symbols and numbering prefixes
  cleaned = cleaned.replace(/^[•\-\*]\s+/gm, "");
  cleaned = cleaned.replace(/^\d+\.\s+/gm, "");
  // Strip prominent emojis to avoid noisy voice output
  cleaned = cleaned.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]|[\u2600-\u26FF\u2700-\u27BF]/g, "");
  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}

export interface UseVoiceAssistantOptions {
  language: SupportedLanguage;
  onTranscriptComplete?: (finalText: string) => void;
}

export type TranscriptionEngine = "browser-native" | "gemini-audio" | "idle";

export function useVoiceAssistant({
  language,
  onTranscriptComplete,
}: UseVoiceAssistantOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [transcriptionStatus, setTranscriptionStatus] = useState<string | null>(null);
  const [activeEngine, setActiveEngine] = useState<TranscriptionEngine>("idle");
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // References
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isManuallyStoppedRef = useRef(false);
  const isCancelledRef = useRef(false);
  const nativeFinalReceivedRef = useRef(false);
  const nativeErrorEncounteredRef = useRef<string | null>(null);

  // Map app languages to BCP-47 speech tags
  const getSpeechLangTag = useCallback((lang: SupportedLanguage): string => {
    switch (lang) {
      case "hi":
        return "hi-IN";
      case "mr":
        return "mr-IN";
      case "pa":
        return "pa-IN";
      case "en":
      default:
        return "en-IN";
    }
  }, []);

  // Initialize Speech Recognition & Synthesis capability checks
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSpeechRec =
        !!(window as any).SpeechRecognition ||
        !!(window as any).webkitSpeechRecognition ||
        !!(window as any).mozSpeechRecognition ||
        !!(window as any).msSpeechRecognition;

      const hasMediaDevices =
        typeof navigator !== "undefined" &&
        !!navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === "function" &&
        typeof MediaRecorder !== "undefined";

      // Supported if either native recognition or MediaRecorder audio fallback is present
      setVoiceSupported(hasSpeechRec || hasMediaDevices);

      if ("speechSynthesis" in window) {
        setTtsSupported(true);
        synthRef.current = window.speechSynthesis;
      }
    }
  }, []);

  // Helper to stop and release active media stream tracks
  const cleanupStream = useCallback(() => {
    if (audioStreamRef.current) {
      try {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch {
        // ignore
      }
      audioStreamRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupStream();
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [cleanupStream]);

  // Transcribe recorded audio blob with server-side Gemini endpoint
  const transcribeAudioBlob = useCallback(
    async (blob: Blob, targetLang: SupportedLanguage) => {
      if (!blob || blob.size < 400) {
        setIsProcessing(false);
        setTranscriptionStatus(null);
        setActiveEngine("idle");
        return;
      }

      setIsProcessing(true);
      setTranscriptionStatus("Transcribing with AgroSaathi AI...");
      setActiveEngine("gemini-audio");

      try {
        const formData = new FormData();
        const extension = blob.type.includes("mp4")
          ? "mp4"
          : blob.type.includes("ogg")
          ? "ogg"
          : blob.type.includes("wav")
          ? "wav"
          : "webm";

        formData.append("audio", blob, `farmer-voice.${extension}`);
        formData.append("language", targetLang);

        const res = await fetch("/api/assistant/transcribe", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.text && data.text.trim().length > 0) {
            const cleanResult = data.text.trim();
            setInterimTranscript(cleanResult);
            if (onTranscriptComplete) {
              onTranscriptComplete(cleanResult);
            }
            setError(null);
          } else if (!data.success) {
            setError(data.message || "AI audio transcription unavailable. Please type your question.");
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          setError(
            errData.message ||
              "Speech service encountered an issue. You can continue typing your question."
          );
        }
      } catch (err) {
        console.warn("Server transcription request failed:", err);
        setError("Transcription network error. You can continue typing your question.");
      } finally {
        setIsProcessing(false);
        setTranscriptionStatus(null);
        setActiveEngine("idle");
      }
    },
    [onTranscriptComplete]
  );

  // Start microphone capture with dual-engine strategy
  const startListening = useCallback(async () => {
    setError(null);
    setInterimTranscript("");
    setTranscriptionStatus("Listening...");
    isManuallyStoppedRef.current = false;
    isCancelledRef.current = false;
    nativeFinalReceivedRef.current = false;
    nativeErrorEncounteredRef.current = null;
    audioChunksRef.current = [];

    // If currently speaking, stop speech first
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }

    if (typeof window === "undefined") return;

    // 1. Acquire microphone stream via getUserMedia for reliable audio capture & server fallback
    let stream: MediaStream | null = null;
    try {
      if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function") {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        audioStreamRef.current = stream;
      }
    } catch (err: any) {
      console.warn("Microphone access error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Microphone permission was denied. Please allow microphone access in your browser settings.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError("No microphone was detected on this device.");
      } else {
        setError("Unable to access microphone. Please type your message.");
      }
      setIsListening(false);
      return;
    }

    // 2. Setup MediaRecorder as robust fallback buffer
    let mediaRecorder: MediaRecorder | null = null;
    if (stream && typeof MediaRecorder !== "undefined") {
      try {
        const mimeTypes = [
          "audio/webm;codecs=opus",
          "audio/webm",
          "audio/mp4",
          "audio/ogg;codecs=opus",
          "audio/wav",
        ];
        const selectedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || "";

        mediaRecorder = selectedMime
          ? new MediaRecorder(stream, { mimeType: selectedMime })
          : new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event: BlobEvent) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          cleanupStream();
          // If cancelled by user, discard
          if (isCancelledRef.current) {
            audioChunksRef.current = [];
            return;
          }

          // If native recognition already provided final text, skip server fallback
          if (nativeFinalReceivedRef.current) {
            audioChunksRef.current = [];
            return;
          }

          // If native recognition failed or produced no final text, send to Gemini fallback
          if (audioChunksRef.current.length > 0) {
            const recordedBlob = new Blob(audioChunksRef.current, {
              type: mediaRecorder?.mimeType || "audio/webm",
            });
            audioChunksRef.current = [];
            transcribeAudioBlob(recordedBlob, language);
          }
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(250); // Slice chunks every 250ms
      } catch (recErr) {
        console.warn("MediaRecorder setup error:", recErr);
      }
    }

    // 3. Setup Browser-Native SpeechRecognition for real-time live preview (if supported)
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch {
            // ignore
          }
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = getSpeechLangTag(language);
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsListening(true);
          setActiveEngine("browser-native");
          setError(null);
        };

        recognition.onresult = (event: any) => {
          let interim = "";
          let final = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const item = event.results[i];
            if (item.isFinal) {
              final += item[0].transcript;
            } else {
              interim += item[0].transcript;
            }
          }

          if (interim) {
            setInterimTranscript(interim);
          }

          if (final.trim()) {
            nativeFinalReceivedRef.current = true;
            setInterimTranscript(final.trim());
            if (onTranscriptComplete) {
              onTranscriptComplete(final.trim());
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Native speech recognition error:", event.error);
          nativeErrorEncounteredRef.current = event.error;

          if (event.error === "not-allowed" || event.error === "permission-denied") {
            setError("Microphone permission was denied. Please allow microphone access in your browser.");
            setIsListening(false);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
              try {
                mediaRecorderRef.current.stop();
              } catch {
                // ignore
              }
            }
          } else if (event.error === "network" || event.error === "service-not-allowed") {
            // DO NOT emit a fatal network error.
            // In Chromium/Brave/restricted networks, Google speech servers are blocked.
            // Seamlessly signal that AgroSaathi AI audio fallback is active!
            setTranscriptionStatus("Browser speech service unavailable. Using AgroSaathi AI fallback...");
            setActiveEngine("gemini-audio");
            // Do not abort MediaRecorder; it continues recording the user's voice for server fallback.
          } else if (event.error === "no-speech") {
            // Quietly handled
          } else {
            console.warn(`Speech recognition status: ${event.error}`);
          }
        };

        recognition.onend = () => {
          // If native recognition ended without final text and not cancelled, stop MediaRecorder to trigger fallback
          if (!nativeFinalReceivedRef.current && !isCancelledRef.current) {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
              try {
                mediaRecorderRef.current.stop();
              } catch {
                // ignore
              }
            }
          }
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
        return;
      } catch (err: any) {
        console.warn("Failed to initialize native speech recognition, continuing with MediaRecorder fallback:", err);
      }
    }

    // If native SpeechRecognition is not supported at all (e.g. Firefox, Brave without Web Speech),
    // MediaRecorder handles recording exclusively!
    if (mediaRecorder) {
      setIsListening(true);
      setActiveEngine("gemini-audio");
      setTranscriptionStatus("Listening (AgroSaathi AI Voice Mode)...");
    } else {
      setError("Voice recording is not supported in this browser. Please type your message.");
      setIsListening(false);
    }
  }, [language, getSpeechLangTag, onTranscriptComplete, cleanupStream, transcribeAudioBlob]);

  // Stop microphone capture and process audio
  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    setIsListening(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    } else {
      cleanupStream();
    }
  }, [cleanupStream]);

  // Cancel microphone capture without submitting or transcribing
  const cancelListening = useCallback(() => {
    isCancelledRef.current = true;
    setIsListening(false);
    setIsProcessing(false);
    setTranscriptionStatus(null);
    setActiveEngine("idle");
    setInterimTranscript("");
    audioChunksRef.current = [];

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }

    cleanupStream();
  }, [cleanupStream]);

  // Text-To-Speech Playback
  const speakText = useCallback(
    (rawText: string, overrideLang?: SupportedLanguage) => {
      if (!synthRef.current || !ttsSupported) return;

      // Stop any current speech
      synthRef.current.cancel();

      const textToSpeak = cleanTextForSpeech(rawText);
      if (!textToSpeak) return;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const targetLang = overrideLang || language;
      const bcpTag = getSpeechLangTag(targetLang);
      utterance.lang = bcpTag;
      utterance.rate = 0.95; // slightly slower for clear agricultural comprehension
      utterance.pitch = 1.0;

      // Try finding an appropriate voice
      const voices = synthRef.current.getVoices();
      if (voices && voices.length > 0) {
        const matchingVoice =
          voices.find((v) => v.lang.toLowerCase() === bcpTag.toLowerCase()) ||
          voices.find((v) => v.lang.toLowerCase().startsWith(targetLang)) ||
          voices.find((v) => v.lang.includes("IN") || v.name.includes("India"));

        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = (e) => {
        console.warn("Speech synthesis error:", e);
        setIsSpeaking(false);
        setIsPaused(false);
      };

      currentUtteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    },
    [language, getSpeechLangTag, ttsSupported]
  );

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  const pauseSpeaking = useCallback(() => {
    if (synthRef.current && synthRef.current.speaking && !synthRef.current.paused) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  const resumeSpeaking = useCallback(() => {
    if (synthRef.current && synthRef.current.paused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  }, []);

  const toggleAutoSpeak = useCallback(() => {
    setAutoSpeak((prev) => !prev);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isListening,
    isProcessing,
    isSpeaking,
    isPaused,
    interimTranscript,
    transcriptionStatus,
    activeEngine,
    voiceSupported,
    ttsSupported,
    autoSpeak,
    error,
    clearError,
    startListening,
    stopListening,
    cancelListening,
    speakText,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    toggleAutoSpeak,
  };
}
