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

export interface ChatResponsePayload {
  reply: string;
  language: SupportedLanguage;
  detectedLanguage?: SupportedLanguage;
  groundings: string[];
  mode: "gemini-live" | "knowledge-base";
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
