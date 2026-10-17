"use client";

import React, { useState } from "react";
import { X, ShieldCheck, Check, Sparkles, UserCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/Button";

export const GoogleAuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, loginWithGoogle, user, logout } = useAuth();
  const { t } = useLanguage();
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const presetAccounts = [
    {
      name: "Ramesh Kumar",
      email: "ramesh.kumar.farmer@gmail.com",
      location: "Jaipur, Rajasthan",
      acres: 3.7,
      initials: "RK",
      color: "from-emerald-500 to-green-700",
    },
    {
      name: "Gurpreet Singh",
      email: "gurpreet.kisan.pb@gmail.com",
      location: "Ludhiana, Punjab",
      acres: 5.5,
      initials: "GS",
      color: "from-amber-500 to-yellow-700",
    },
    {
      name: "Prakash Shinde",
      email: "prakash.shinde.agri@gmail.com",
      location: "Nashik, Maharashtra",
      acres: 2.8,
      initials: "PS",
      color: "from-blue-500 to-sky-700",
    },
  ];

  const handleSelectPreset = async (preset: typeof presetAccounts[0]) => {
    setIsLoading(true);
    await loginWithGoogle({
      name: preset.name,
      email: preset.email,
      location: preset.location,
      acres: preset.acres,
    });
    setIsLoading(false);
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customEmail) return;
    setIsLoading(true);
    await loginWithGoogle({
      name: customName,
      email: customEmail,
      location: "Jaipur, Rajasthan",
      acres: 3.0,
    });
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            {/* Google G Logo SVG */}
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <h3 className="text-base font-bold text-slate-800">
              Sign in with Google
            </h3>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-700 text-white font-bold text-lg shadow-sm">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 truncate">
                      {user.name}
                    </span>
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  </div>
                  <span className="block text-xs text-slate-500 truncate">
                    {user.email}
                  </span>
                  <span className="block text-[11px] text-emerald-700 font-semibold mt-0.5">
                    {user.location} • {user.acres} Acres
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Sign Out
                </Button>
                <Button variant="primary" size="sm" onClick={closeAuthModal}>
                  Continue to Farm Dashboard
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center space-y-1">
                <h4 className="text-lg font-black text-slate-900">
                  Welcome to KrishiSetu AI
                </h4>
                <p className="text-xs text-slate-500">
                  Choose a verified farmer Google Account to access localized weather, mandi rates, and disease diagnoses.
                </p>
              </div>

              {!isCustomMode ? (
                <div className="space-y-2.5">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Select Farmer Account
                  </span>

                  {presetAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      disabled={isLoading}
                      onClick={() => handleSelectPreset(acc)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-krishi-500 hover:bg-emerald-50/40 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr ${acc.color} text-white font-bold text-xs shadow-xs`}
                        >
                          {acc.initials}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 group-hover:text-krishi-800 transition-colors">
                            {acc.name}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                            {acc.email}
                          </div>
                          <div className="text-[10px] text-emerald-700 font-medium">
                            {acc.location}
                          </div>
                        </div>
                      </div>

                      <div className="text-slate-300 group-hover:text-krishi-600 transition-colors pr-1">
                        <Check className="h-4 w-4" />
                      </div>
                    </button>
                  ))}

                  <div className="pt-2">
                    <button
                      onClick={() => setIsCustomMode(true)}
                      className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-krishi-700 text-center transition-colors"
                    >
                      Use another Google account →
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCustomLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Farmer Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Google Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="farmer@gmail.com"
                      className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCustomMode(false)}
                      className="text-xs font-medium text-slate-500 hover:text-slate-700"
                    >
                      ← Back to presets
                    </button>

                    <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
                      Continue with Google
                    </Button>
                  </div>
                </form>
              )}

              {/* Data Safety Note */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 text-[11px] text-slate-500 border border-slate-100">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Your Google identity is securely encrypted. We never share your crop yield or mandi transactions with unauthorized third parties.
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
