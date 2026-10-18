"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SupportedLanguage } from "@/i18n/translations";

// Clean text for speech synthesis to avoid speaking raw Markdown syntax, emojis, URLs, and code
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

export function useVoiceAssistant({
  language,
  onTranscriptComplete,
}: UseVoiceAssistantOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // References
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isManuallyStoppedRef = useRef(false);

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
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition ||
        (window as any).mozSpeechRecognition ||
        (window as any).msSpeechRecognition;

      setVoiceSupported(!!SpeechRecognition);

      if ("speechSynthesis" in window) {
        setTtsSupported(true);
        synthRef.current = window.speechSynthesis;
      }
    }
  }, []);

  // Stop speaking on unmount
  useEffect(() => {
    return () => {
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
    };
  }, []);

  // Start microphone capture
  const startListening = useCallback(() => {
    setError(null);
    setInterimTranscript("");
    isManuallyStoppedRef.current = false;

    // If currently speaking, stop speech first
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }

    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Please type your message.");
      return;
    }

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
          setInterimTranscript(final.trim());
          if (onTranscriptComplete) {
            onTranscriptComplete(final.trim());
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          setError("Microphone permission was denied. Please allow microphone access in your browser settings.");
        } else if (event.error === "no-speech") {
          // silent fallback
        } else if (event.error === "network") {
          setError("Network issue during speech transcription. Please check connection.");
        } else {
          setError(`Speech capture error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn("Failed to initialize speech recognition:", err);
      setError("Unable to start microphone recording.");
      setIsListening(false);
    }
  }, [language, getSpeechLangTag, onTranscriptComplete]);

  // Stop microphone capture
  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

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
        console.warn("Speech synthesis utterance error:", e);
        setIsSpeaking(false);
        setIsPaused(false);
      };

      currentUtteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    },
    [language, ttsSupported, getSpeechLangTag]
  );

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const pauseSpeaking = useCallback(() => {
    if (synthRef.current && synthRef.current.speaking) {
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
    setAutoSpeak((prev) => {
      const next = !prev;
      if (!next && synthRef.current) {
        synthRef.current.cancel();
        setIsSpeaking(false);
      }
      return next;
    });
  }, []);

  return {
    isListening,
    isSpeaking,
    isPaused,
    interimTranscript,
    setInterimTranscript,
    voiceSupported,
    ttsSupported,
    autoSpeak,
    error,
    clearError: () => setError(null),
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    toggleAutoSpeak,
  };
}
