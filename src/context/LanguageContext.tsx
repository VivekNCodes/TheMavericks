"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  translations,
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  LanguageOption,
} from "@/i18n/translations";

type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  languages: LanguageOption[];
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");

  useEffect(() => {
    // Read persisted language preference from localStorage
    const saved = localStorage.getItem("krishisetu_language") as SupportedLanguage;
    if (saved && translations[saved]) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("krishisetu_language", lang);
    }
  };

  const t = (key: TranslationKey): string => {
    const langDict = translations[language];
    if (langDict && key in langDict) {
      return (langDict as Record<string, string>)[key];
    }
    // Fallback to English
    return (translations.en as Record<string, string>)[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        languages: SUPPORTED_LANGUAGES,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
