import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { GoogleAuthModal } from "@/components/auth/GoogleAuthModal";
import { siteConfig } from "@/config/site";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} - ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "KrishiSetu AI",
    "Smart Farming",
    "Crop Disease Detection",
    "Mandi Prices",
    "Irrigation Advisor",
    "Farmer Marketplace",
    "Indian Agriculture",
  ],
  authors: [{ name: "The Mavericks" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#15803D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#F8FAF8] text-slate-800 antialiased font-sans">
        <LanguageProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
            <GoogleAuthModal />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
