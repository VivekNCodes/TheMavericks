import { SupportedLanguage } from "@/i18n/translations";

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  language?: SupportedLanguage;
  groundings?: string[];
  mode?: "gemini-live" | "knowledge-base";
  isError?: boolean;
}

export interface ChatRequestPayload {
  messages: Array<{
    role: MessageRole;
    content: string;
  }>;
  language: SupportedLanguage;
  farmerLocation?: string;
  activeCropContext?: string;
}

export interface CommandAction {
  type: "navigate" | "open_modal" | "change_language" | "stop_speech" | "none";
  target?: string;
  message?: string;
}

export interface ChatResponsePayload {
  reply: string;
  language: SupportedLanguage;
  detectedLanguage?: SupportedLanguage;
  groundings: string[];
  mode: "gemini-live" | "knowledge-base";
  commandAction?: CommandAction;
}

export interface VoiceAssistantState {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  interimTranscript: string;
  voiceSupported: boolean;
  ttsSupported: boolean;
  autoSpeak: boolean;
  selectedVoiceLang: "en-IN" | "hi-IN" | "mr-IN" | "pa-IN";
  error: string | null;
}

export interface SuggestedPrompt {
  id: string;
  category: "crop_disease" | "irrigation" | "soils" | "mandi" | "general";
  categoryLabel: Record<SupportedLanguage, string>;
  text: Record<SupportedLanguage, string>;
}

export interface ChatSessionRecord {
  id: string;
  userId?: string;
  farmerName: string;
  title: string;
  language: SupportedLanguage;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}
