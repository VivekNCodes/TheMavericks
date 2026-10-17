"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bot, Sparkles, X, MessageSquareText } from "lucide-react";
import { ChatInterface } from "./ChatInterface";
import { useLanguage } from "@/context/LanguageContext";

export const FloatingChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { language } = useLanguage();

  // Close floating drawer if user navigates to the dedicated full-page assistant
  useEffect(() => {
    if (pathname === "/assistant" || pathname === "/chat") {
      setIsOpen(false);
    }
  }, [pathname]);

  // Handle escape key to close floating drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Don't render floating button if user is already on the dedicated chat/assistant page
  if (pathname === "/assistant" || pathname === "/chat") {
    return null;
  }

  // Multilingual button labels
  const getButtonLabel = () => {
    switch (language) {
      case "hi":
        return "कृषि मित्र";
      case "mr":
        return "कृषी सहाय्यक";
      case "pa":
        return "ਏਆਈ ਮਿੱਤਰ";
      default:
        return "AI Sahayak";
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
          {/* Pulse pill badge */}
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open KrishiSetu AI Assistant"
            className="group flex items-center gap-2.5 bg-gradient-to-r from-krishi-600 to-krishi-700 hover:from-krishi-700 hover:to-krishi-800 text-white pl-4 pr-5 py-3 rounded-full shadow-lg shadow-krishi-900/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 border border-krishi-500/30"
          >
            <div className="relative flex items-center justify-center">
              <Bot className="h-5 w-5 text-krishi-100 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300"></span>
              </span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-black tracking-wide leading-none flex items-center gap-1">
                {getButtonLabel()}
                <Sparkles className="h-3 w-3 text-amber-300 animate-pulse" />
              </span>
              <span className="text-[10px] text-krishi-200/90 font-medium leading-tight mt-0.5">
                ICAR & Weather AI
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-5 sm:right-5 sm:w-[480px] sm:h-[680px] sm:max-h-[85vh] z-50 flex flex-col bg-white sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          <ChatInterface
            isFloatingDrawer={true}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}
    </>
  );
};
