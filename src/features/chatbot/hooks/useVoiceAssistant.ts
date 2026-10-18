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

export type TranscriptionEngine = "gemini-audio" | "idle";

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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isCancelledRef = useRef(false);
  const autoStopTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Map app languages to BCP-47 speech tags for TTS
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

  // Check hardware and browser support for MediaRecorder & SpeechSynthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasMediaDevices =
        typeof navigator !== "undefined" &&
        !!navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === "function" &&
        typeof MediaRecorder !== "undefined";

      setVoiceSupported(hasMediaDevices);

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
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
      }
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel();
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

  // Transcribe recorded audio blob via server-side Gemini STT endpoint
  const transcribeAudioBlob = useCallback(
    async (blob: Blob, targetLang: SupportedLanguage) => {
      if (!blob || blob.size < 400) {
        setIsProcessing(false);
        setTranscriptionStatus(null);
        setActiveEngine("idle");
        setError("No audio detected. Please try speaking closer to your microphone or type your question.");
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

        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success) {
          if (data.text && data.text.trim().length > 0) {
            const cleanResult = data.text.trim();
            setInterimTranscript(cleanResult);
            setError(null);
            if (onTranscriptComplete) {
              onTranscriptComplete(cleanResult);
            }
          } else {
            setError(data.message || "No speech detected in audio. Please speak clearly or type your message.");
          }
        } else {
          setError(
            data.message ||
              "AI speech transcription is temporarily unavailable. Please type your message."
          );
        }
      } catch (err: unknown) {
        console.warn("Server transcription request failed:", err);
        setError("Network error during speech transcription. Please type your message.");
      } finally {
        setIsProcessing(false);
        setTranscriptionStatus(null);
        setActiveEngine("idle");
      }
    },
    [onTranscriptComplete]
  );

  // Stop recording and send audio for transcription
  const stopListening = useCallback(() => {
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }

    setIsListening(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        cleanupStream();
      }
    } else {
      cleanupStream();
    }
  }, [cleanupStream]);

  // Start microphone recording cleanly with MediaRecorder (No simultaneous native speech recognition)
  const startListening = useCallback(async () => {
    setError(null);
    setInterimTranscript("");
    setTranscriptionStatus("Listening...");
    isCancelledRef.current = false;
    audioChunksRef.current = [];

    // If currently speaking, stop speech first
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }

    if (typeof window === "undefined") return;

    // 1. Acquire microphone stream via getUserMedia
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
      } else {
        throw new Error("MEDIA_DEVICES_NOT_SUPPORTED");
      }
    } catch (err: unknown) {
      const errName = err instanceof Error ? err.name : "";
      console.warn("Microphone access error:", err);
      if (errName === "NotAllowedError" || errName === "PermissionDeniedError") {
        setError("Microphone permission was denied. Please allow microphone access in your browser settings.");
      } else if (errName === "NotFoundError" || errName === "DevicesNotFoundError") {
        setError("No microphone was detected on this device.");
      } else {
        setError("Unable to access microphone. Please type your message.");
      }
      setIsListening(false);
      return;
    }

    // 2. Setup MediaRecorder for reliable audio capture
    try {
      const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg;codecs=opus",
        "audio/wav",
      ];
      const selectedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || "";

      const mediaRecorder = selectedMime
        ? new MediaRecorder(stream, { mimeType: selectedMime })
        : new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        cleanupStream();

        // If cancelled by user, discard buffer
        if (isCancelledRef.current) {
          audioChunksRef.current = [];
          return;
        }

        if (audioChunksRef.current.length > 0) {
          const recordedBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorder?.mimeType || "audio/webm",
          });
          audioChunksRef.current = [];
          transcribeAudioBlob(recordedBlob, language);
        } else {
          setError("No audio captured. Please speak closer to your microphone or type your message.");
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250); // Slice chunks every 250ms
      setIsListening(true);
      setActiveEngine("gemini-audio");
      setTranscriptionStatus("Listening... Click microphone to finish speaking.");

      // Safety timeout: automatically stop after 60 seconds of recording
      if (autoStopTimerRef.current) {
        clearTimeout(autoStopTimerRef.current);
      }
      autoStopTimerRef.current = setTimeout(() => {
        stopListening();
      }, 60000);
    } catch (recErr: unknown) {
      console.error("MediaRecorder initialization error:", recErr);
      setError("Audio recording could not be initialized. Please type your message.");
      setIsListening(false);
      cleanupStream();
    }
  }, [language, cleanupStream, transcribeAudioBlob, stopListening]);

  // Cancel ongoing recording without transcribing
  const cancelListening = useCallback(() => {
    isCancelledRef.current = true;
    audioChunksRef.current = [];
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    setIsListening(false);
    setIsProcessing(false);
    setTranscriptionStatus(null);
    setActiveEngine("idle");

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    cleanupStream();
  }, [cleanupStream]);

  // Text-To-Speech Synthesis helper
  const speakText = useCallback(
    (rawText: string, targetLang?: SupportedLanguage) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      const synth = window.speechSynthesis;
      synth.cancel();

      const text = cleanTextForSpeech(rawText);
      if (!text) return;

      const lang = targetLang || language;
      const langTag = getSpeechLangTag(lang);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langTag;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      const voices = synth.getVoices();
      if (voices.length > 0) {
        const matchingVoice =
          voices.find((v) => v.lang === langTag || v.lang.startsWith(lang)) ||
          voices.find((v) => v.lang.includes("IN") || v.lang.includes("hi") || v.lang.includes("en-IN"));
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
        if (e.error !== "interrupted" && e.error !== "canceled") {
          console.warn("Speech synthesis playback notice:", e.error);
        }
        setIsSpeaking(false);
        setIsPaused(false);
      };

      currentUtteranceRef.current = utterance;
      synth.speak(utterance);
    },
    [language, getSpeechLangTag]
  );

  const stopSpeaking = useCallback(() => {
    if (synthRef.current && synthRef.current.speaking) {
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
