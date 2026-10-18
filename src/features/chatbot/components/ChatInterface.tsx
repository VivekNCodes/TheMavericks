"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  RotateCcw,
  Globe,
  BookOpen,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Loader2,
  CheckCircle2,
  MapPin,
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  Play,
  Pause,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { SupportedLanguage } from "@/i18n/translations";
import { ChatMessage, SuggestedPrompt } from "../types";
import { SUGGESTED_FARMER_PROMPTS } from "../data/suggested-prompts";
import { useVoiceAssistant } from "../hooks/useVoiceAssistant";

export interface ChatInterfaceProps {
  className?: string;
  initialPrompt?: string;
  isFloatingDrawer?: boolean;
  onClose?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  className = "",
  initialPrompt,
  isFloatingDrawer = false,
  onClose,
}) => {
  const router = useRouter();
  const { language, setLanguage, languages, t } = useLanguage();
  const { user } = useAuth();

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<"gemini-live" | "knowledge-base">("gemini-live");
  const [sessionId, setSessionId] = useState<string>(() => `chat-${Date.now()}`);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Voice Assistant Hook
  const {
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
    error: voiceError,
    clearError: clearVoiceError,
    startListening,
    stopListening,
    cancelListening,
    speakText,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    toggleAutoSpeak,
  } = useVoiceAssistant({
    language,
    onTranscriptComplete: (finalTranscript) => {
      if (finalTranscript && finalTranscript.trim()) {
        handleSendMessage(finalTranscript.trim());
      }
    },
  });

  // Track speech finish
  useEffect(() => {
    if (!isSpeaking) {
      setSpeakingMessageId(null);
    }
  }, [isSpeaking]);

  // Initialize conversation with multilingual greeting
  useEffect(() => {
    const greetings: Record<SupportedLanguage, string> = {
      en: "Hello! I am AgroSaathi AI Sahayak, your personal agricultural assistant. Ask me anything by typing or speaking about your crops, diseases, irrigation, weather, or market rates.",
      hi: "नमस्ते किसान साथी! मैं एग्रोसाथी एआई सहायक हूँ। आप बोलकर या लिखकर अपनी फसल, बीमारी, खाद, सिंचाई, मौसम या मंडी भाव के बारे में पूछ सकते हैं।",
      mr: "नमस्कार शेतकरी बंधू! मी ॲग्रोसाथी एआय सहाय्यक आहे. पीक रोग, सिंचन नियोजन, खत व्यवस्थापन किंवा हवामानाबद्दल बोलून किंवा लिहून आपले प्रश्न विचारा.",
      pa: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ! ਮੈਂ ਐਗਰੋਸਾਥੀ AI ਸਹਾਇਕ ਹਾਂ। ਤੁਸੀਂ ਫ਼ਸਲਾਂ ਦੇ ਰੋਗਾਂ, ਸਿੰਚਾਈ ਦੇ ਸਮੇਂ, ਮਿੱਟੀ ਜਾਂ ਮੌਸਮ ਬਾਰੇ ਬੋਲ ਕੇ ਜਾਂ ਲਿਖ ਕੇ ਕੋਈ ਵੀ ਸਵਾਲ ਪੁੱਛ ਸਕਦੇ ਹੋ।",
    };

    setMessages([
      {
        id: "msg-welcome",
        role: "assistant",
        content: greetings[language] || greetings.en,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        language,
        mode: "gemini-live",
        groundings: ["ICAR & FAO-56 Package of Practices", "Live Open-Meteo Weather"],
      },
    ]);
  }, [language]);

  const searchParams = useSearchParams();
  const queryParamPrompt = searchParams?.get("q") || undefined;
  const effectiveInitialPrompt = initialPrompt || queryParamPrompt;
  const initialSentRef = useRef<string | null>(null);

  // Send initial prompt if provided via prop or URL query parameter
  useEffect(() => {
    if (
      effectiveInitialPrompt &&
      effectiveInitialPrompt.trim() !== "" &&
      initialSentRef.current !== effectiveInitialPrompt
    ) {
      initialSentRef.current = effectiveInitialPrompt;
      handleSendMessage(effectiveInitialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveInitialPrompt]);

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, isLoading, interimTranscript]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    // If currently listening, stop
    if (isListening) {
      stopListening();
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      language,
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText("");
    setIsLoading(true);

    try {
      const payloadMessages = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
          language,
          farmerLocation: user?.location || "Jaipur, Rajasthan",
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const assistantMessage: ChatMessage = {
            id: `ai-${Date.now()}`,
            role: "assistant",
            content: json.data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            language: json.data.language || language,
            groundings: json.data.groundings || [],
            mode: json.data.mode || "gemini-live",
          };

          setActiveMode(json.data.mode);
          setMessages((prev) => [...prev, assistantMessage]);

          // Handle Voice / Command routing if present
          if (json.data.commandAction) {
            const action = json.data.commandAction;
            if (action.type === "navigate" && action.target) {
              setTimeout(() => {
                router.push(action.target);
              }, 1200);
            } else if (action.type === "change_language" && action.target) {
              setLanguage(action.target as SupportedLanguage);
            } else if (action.type === "stop_speech") {
              stopSpeaking();
            }
          }

          // Voice playback if autoSpeak is enabled
          if (autoSpeak && ttsSupported) {
            setSpeakingMessageId(assistantMessage.id);
            speakText(json.data.reply, json.data.language || language);
          }

          // Persist to local sessions store
          try {
            const updatedList = [...newHistory, assistantMessage];
            localStorage.setItem(
              `agrosaathi_chat_${sessionId}`,
              JSON.stringify(updatedList)
            );
          } catch {
            // ignore
          }
          return;
        }
      }

      // Handle response error
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "I encountered a temporary connection issue. Please check your network or try asking again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true,
        },
      ]);
    } catch (e) {
      console.warn("Chat submission error:", e);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "Network timeout. Unable to connect to the agricultural intelligence service right now.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    stopSpeaking();
    stopListening();
    setSessionId(`chat-${Date.now()}`);
    const greetings: Record<SupportedLanguage, string> = {
      en: "Conversation cleared. How can I assist your farm today?",
      hi: "बातचीत साफ़ कर दी गई है। आज मैं आपके खेत के लिए क्या सहायता कर सकता हूँ?",
      mr: "संभाषण रीसेट केले. आज आपल्या शेतीसाठी मी काय मदत करू शकतो?",
      pa: "ਗੱਲਬਾਤ ਸਾਫ਼ ਕਰ ਦਿੱਤੀ ਗਈ ਹੈ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਖੇਤੀ ਲਈ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
    };

    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content: greetings[language] || greetings.en,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        language,
        mode: "gemini-live",
      },
    ]);
  };

  const handleToggleSpeakMessage = (msg: ChatMessage) => {
    if (isSpeaking && speakingMessageId === msg.id) {
      stopSpeaking();
      setSpeakingMessageId(null);
    } else {
      setSpeakingMessageId(msg.id);
      speakText(msg.content, msg.language || language);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  return (
    <div
      className={`flex flex-col bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden ${
        isFloatingDrawer ? "h-full" : "h-[78vh] min-h-[580px]"
      } ${className}`}
    >
      {/* 1. Header with Model Status, Voice Assistant Controls, and Language Switcher */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white shrink-0 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 rounded-2xl bg-krishi-700 border border-emerald-400/40 flex items-center justify-center text-white shadow-sm">
            <Bot className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">
                AgroSaathi AI Sahayak
              </span>
              <Badge
                variant="green"
                size="sm"
                className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[10px] py-0 px-1.5"
              >
                {activeMode === "gemini-live" ? "Gemini 1.5 Flash" : "Knowledge Base"}
              </Badge>
            </div>
            <div className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
              <span>{user?.location || "Jaipur, Rajasthan"}</span>
              <span>•</span>
              <span className="text-emerald-300 font-medium">Voice Enabled</span>
            </div>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Spoken Response Auto-Speak Toggle */}
          {ttsSupported && (
            <button
              type="button"
              onClick={toggleAutoSpeak}
              className={`p-1.5 rounded-xl border transition-all ${
                autoSpeak
                  ? "bg-emerald-600/30 border-emerald-500/50 text-emerald-300 hover:bg-emerald-600/50"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
              title={autoSpeak ? "Spoken responses enabled (click to mute)" : "Spoken responses muted (click to enable)"}
            >
              {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          )}

          {/* Stop Audio Button (When Speaking) */}
          {isSpeaking && (
            <button
              type="button"
              onClick={stopSpeaking}
              className="flex items-center gap-1 px-2 py-1 bg-red-600/80 hover:bg-red-600 text-white text-[11px] font-bold rounded-xl animate-pulse transition-colors"
              title="Stop speaking"
            >
              <Square className="h-3 w-3 fill-current" />
              <span>Stop Audio</span>
            </button>
          )}

          {/* Language Toggle Dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
            >
              <Globe className="h-3.5 w-3.5 text-krishi-400" />
              <span>{currentLangObj.flag}</span>
              <span className="hidden sm:inline text-[11px]">{currentLangObj.nativeName}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            <div className="absolute right-0 mt-1 w-36 bg-white text-slate-800 border border-slate-200 rounded-xl shadow-xl py-1 z-30 hidden group-hover:block animate-in fade-in-50">
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                    language === l.code ? "font-bold text-krishi-800 bg-krishi-50" : "text-slate-700"
                  }`}
                >
                  <span>{l.flag}</span>
                  <span>{l.nativeName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Clear conversation */}
          <button
            type="button"
            onClick={handleClearChat}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
            title="Clear Chat History"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Close drawer (floating mode) */}
          {isFloatingDrawer && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors ml-1"
              title="Close Assistant"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Voice Error Notification if any */}
      {voiceError && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span>{voiceError}</span>
          </div>
          <button onClick={clearVoiceError} className="text-slate-400 hover:text-slate-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 2. Message History Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50 scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          const isMsgSpeaking = isSpeaking && speakingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 sm:gap-3 ${
                isUser ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`h-8 w-8 rounded-2xl flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs ${
                  isUser
                    ? "bg-krishi-700 text-white"
                    : "bg-white text-krishi-800 border border-krishi-200"
                }`}
              >
                {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4 text-krishi-700" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`group/msg relative max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? "bg-krishi-800 text-white rounded-tr-xs"
                    : msg.isError
                    ? "bg-red-50 text-red-900 border border-red-200 rounded-tl-xs"
                    : "bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs"
                }`}
              >
                {/* Message Body */}
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Grounding & Verification Citations */}
                {!isUser && msg.groundings && msg.groundings.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Grounding:
                    </span>
                    {msg.groundings.map((citation, cIdx) => (
                      <span
                        key={cIdx}
                        className="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-md"
                      >
                        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                        <span>{citation}</span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Bubble Footer: Timestamp & Speech Trigger */}
                <div className="flex items-center justify-between mt-2 pt-1">
                  {!isUser && ttsSupported && (
                    <button
                      type="button"
                      onClick={() => handleToggleSpeakMessage(msg)}
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors ${
                        isMsgSpeaking
                          ? "bg-emerald-100 text-emerald-800 animate-pulse"
                          : "text-slate-400 hover:text-krishi-800 hover:bg-slate-100"
                      }`}
                      title={isMsgSpeaking ? "Stop reading response" : "Read response aloud"}
                    >
                      {isMsgSpeaking ? (
                        <>
                          <VolumeX className="h-3 w-3" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3 w-3" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  )}

                  <div
                    className={`text-[10px] font-medium ml-auto ${
                      isUser ? "text-emerald-200/70" : "text-slate-400"
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Speech Recognition & AI Transcription Status Bubble */}
        {(isListening || isProcessing) && (
          <div className="flex items-start gap-2.5 sm:gap-3 flex-row-reverse animate-in fade-in">
            <div
              className={`h-8 w-8 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-xs ${
                isProcessing ? "bg-amber-500 animate-spin" : "bg-red-500 animate-pulse"
              }`}
            >
              {isProcessing ? <Loader2 className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </div>
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 border text-xs sm:text-sm rounded-tr-xs shadow-xs ${
                isProcessing
                  ? "bg-amber-50 border-amber-200 text-amber-950"
                  : "bg-red-50/80 border-red-200 text-red-950"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isProcessing ? "bg-amber-500 animate-ping" : "bg-red-500 animate-ping"
                    }`}
                  />
                  <span>
                    {transcriptionStatus ||
                      (isProcessing ? "Transcribing with AgroSaathi AI..." : "Listening to your voice...")}
                  </span>
                </div>
                {isListening && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={stopListening}
                      className="px-2 py-0.5 text-[10px] font-semibold bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                      title="Done speaking"
                    >
                      Done
                    </button>
                    <button
                      type="button"
                      onClick={cancelListening}
                      className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md transition-colors"
                      title="Cancel recording"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <p className="italic text-slate-800">
                {interimTranscript ||
                  (isProcessing
                    ? "Converting voice to text..."
                    : "Speak your question now (e.g. 'How is my wheat crop doing?')...")}
              </p>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="h-8 w-8 rounded-2xl bg-white border border-krishi-200 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-krishi-700" />
            </div>
            <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs shadow-xs text-xs text-slate-600 flex items-center gap-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-krishi-600" />
              <span className="font-medium animate-pulse">
                Consulting AgroSaathi agricultural knowledge base & your farm profile...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Suggested Questions Carousel / Chip Row */}
      <div className="p-2 sm:px-4 bg-white border-t border-slate-100 shrink-0 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            Quick:
          </span>
          {SUGGESTED_FARMER_PROMPTS.map((prompt) => (
            <button
              key={prompt.id}
              type="button"
              onClick={() => handleSendMessage(prompt.text[language] || prompt.text.en)}
              className="px-2.5 py-1 text-left text-[11px] font-medium bg-slate-50 hover:bg-krishi-50 text-slate-700 hover:text-krishi-900 border border-slate-200 hover:border-krishi-300 rounded-full transition-all whitespace-nowrap shrink-0"
            >
              {prompt.text[language] || prompt.text.en}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Chat Input Bar with Microphone & Voice Output Controls */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
        {voiceError && (
          <div className="mb-2 p-2.5 px-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>{voiceError}</span>
            </div>
            <button
              type="button"
              onClick={clearVoiceError}
              className="text-amber-700 hover:text-amber-900 text-xs font-semibold shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-krishi-500/20 focus-within:border-krishi-600 transition-all">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isProcessing
                ? "Transcribing your voice..."
                : isListening
                ? "Listening... you can speak or type..."
                : language === "hi"
                ? "बोलकर या लिखकर पूछें (जैसे: मेरी गेहूं की फसल कैसी है?)..."
                : language === "mr"
                ? "बोलून किंवा लिहून विचारा (उदा. पिकाला पाणी कधी द्यावे?)..."
                : language === "pa"
                ? "ਬੋਲ ਕੇ ਜਾਂ ਲਿਖ ਕੇ ਪੁੱਛੋ (ਫ਼ਸਲ ਜਾਂ ਮੌਸਮ ਬਾਰੇ)..."
                : "Ask by voice or text (e.g. 'How is my wheat crop doing?')..."
            }
            rows={1}
            maxLength={1200}
            className="flex-1 bg-transparent border-0 resize-none max-h-28 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none p-1 font-medium"
          />

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Microphone Button */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={isListening ? stopListening : startListening}
              className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                isProcessing
                  ? "bg-amber-100 text-amber-800 border border-amber-300 cursor-wait"
                  : isListening
                  ? "bg-red-500 text-white animate-pulse ring-4 ring-red-200"
                  : "bg-white hover:bg-emerald-50 text-slate-600 hover:text-krishi-700 border border-slate-200"
              }`}
              title={
                isProcessing
                  ? "Transcribing your voice with AgroSaathi AI..."
                  : !voiceSupported
                  ? "Speech recognition is not supported in this browser"
                  : isListening
                  ? "Click to stop recording and transcribe"
                  : "Start voice recording (Speak in English or Hindi)"
              }
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin text-amber-700" />
              ) : isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>

            {/* Send Button */}
            <Button
              type="button"
              size="sm"
              variant="primary"
              disabled={!inputText.trim() || isLoading}
              onClick={() => handleSendMessage()}
              className="h-9 w-9 rounded-xl p-0 flex items-center justify-center shrink-0 shadow-sm"
              title="Send message (Enter)"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Footer Advisory & Voice Features Disclaimer */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
          <div className="flex items-center gap-1">
            <HelpCircle className="h-3 w-3 text-slate-400" />
            <span>
              Voice commands: &quot;Open dashboard&quot;, &quot;Show my crops&quot;, &quot;Add crop&quot;, &quot;Switch to Hindi&quot;.
            </span>
          </div>
          <span className="hidden sm:inline">Personalized Farm Context Grounding</span>
        </div>
      </div>
    </div>
  );
};
