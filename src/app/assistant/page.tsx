import React from "react";
import type { Metadata } from "next";
import { ChatInterface } from "@/features/chatbot/components/ChatInterface";

export const metadata: Metadata = {
  title: "AgroSaathi AI Sahayak | Agricultural Assistant",
  description:
    "Multilingual conversational agricultural AI assistant for Indian farmers. Get grounded explanations on crop pathology, soil health, irrigation schedules, and weather advisories in Hindi, Marathi, Punjabi, and English.",
};

export default function AssistantPage() {
  return (
    <div className="max-w-6xl mx-auto py-2">
      <ChatInterface />
    </div>
  );
}
