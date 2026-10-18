"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  ShieldCheck,
  MapPin,
  Sprout,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Calendar,
  Layers,
  Droplets,
  Award,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SupportedLanguage } from "@/i18n/translations";
import Link from "next/link";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: isAuthLoading, updateProfile, deleteAccount, openAuthModal } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [preferredName, setPreferredName] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<SupportedLanguage>("en");
  const [state, setState] = useState("Rajasthan");
  const [district, setDistrict] = useState("Jaipur");
  const [village, setVillage] = useState("");
  const [farmSize, setFarmSize] = useState<number | string>(3.0);
  const [farmSizeUnit, setFarmSizeUnit] = useState("acre");
  const [soilType, setSoilType] = useState("Sandy Loam");
  const [irrigationMethod, setIrrigationMethod] = useState("Drip & Tube-well");
  const [farmingExperience, setFarmingExperience] = useState<number | string>(10);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setPreferredName(user.preferredName || user.name || "");
      setPreferredLanguage(user.preferredLanguage || (language as SupportedLanguage) || "en");
      setState(user.state || "Rajasthan");
      setDistrict(user.district || "Jaipur");
      setVillage(user.village || "");
      setFarmSize(user.farmSize !== undefined ? user.farmSize : user.acres || 3.0);
      setFarmSizeUnit(user.farmSizeUnit || "acre");
      setSoilType(user.soilType || "Sandy Loam");
      setIrrigationMethod(user.irrigationMethod || "Drip & Tube-well");
      setFarmingExperience(user.farmingExperience || 10);
    }
  }, [user, language]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    const ok = await updateProfile({
      name: preferredName || user?.name,
      preferredName,
      preferredLanguage,
      state,
      district,
      village,
      farmSize: typeof farmSize === "string" ? parseFloat(farmSize) : farmSize,
      acres: typeof farmSize === "string" ? parseFloat(farmSize) : farmSize,
      farmSizeUnit,
      soilType,
      irrigationMethod,
      farmingExperience: typeof farmingExperience === "string" ? parseInt(farmingExperience, 10) : farmingExperience,
    });

    setIsSaving(false);
    if (ok) {
      setSaveSuccess(true);
      if (preferredLanguage !== language) {
        setLanguage(preferredLanguage);
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    await deleteAccount();
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-krishi-600" />
          <span className="text-sm font-semibold">Loading your farmer profile...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !user) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center px-4">
        <Card className="p-8 space-y-4">
          <div className="h-16 w-16 mx-auto rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <User className="h-8 w-8 stroke-[1.8]" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Protected Account Profile</h2>
          <p className="text-sm text-slate-600">
            Please sign in with your Google account to view and manage your farm crops, location details, and personalized AI preferences.
          </p>
          <Button variant="primary" onClick={openAuthModal} className="mt-2">
            Continue with Google
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "AG"}
            <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">
                {user?.preferredName || user?.name || "Farmer"}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Verified Farmer
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{user?.location || "Jaipur, Rajasthan"}</span>
              <span>•</span>
              <span>ID: {user?.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/#crops"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-krishi-800 bg-krishi-50 border border-krishi-200 hover:bg-krishi-100 transition-colors"
          >
            View Saved Crops →
          </Link>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Profile changes saved successfully to your persistent account!</span>
        </div>
      )}

      {/* Profile Form */}
      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">
              Agricultural Profile & Farm Details
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              AgroSaathi uses this context to personalize your crop advisories, disease treatments, and irrigation alerts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Preferred Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preferred Farmer Name
              </label>
              <input
                type="text"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preferred Language (भाषा)
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value as SupportedLanguage)}
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:bg-white focus:outline-none"
              >
                <option value="en">English (English)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
              </select>
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                State (राज्य)
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Rajasthan"
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                District (ज़िला)
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Jaipur"
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Village */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Village / Tehsil (गांव / तहसील - Optional)
              </label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="e.g. Sanganer"
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Farm Size & Unit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Total Farm Size
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={farmSize}
                  onChange={(e) => setFarmSize(e.target.value)}
                  placeholder="3.5"
                  className="flex-1 h-11 px-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:bg-white focus:outline-none"
                />
                <select
                  value={farmSizeUnit}
                  onChange={(e) => setFarmSizeUnit(e.target.value)}
                  className="w-24 h-11 px-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:bg-white focus:outline-none"
                >
                  <option value="acre">Acres</option>
                  <option value="hectare">Hectares</option>
                  <option value="bigha">Bigha</option>
                </select>
              </div>
            </div>

            {/* Soil Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Soil Type (मिट्टी का प्रकार)
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:bg-white focus:outline-none"
              >
                <option value="Sandy Loam">Sandy Loam (बलुई दोमट)</option>
                <option value="Clay Loam">Clay Loam (मटियार दोमट)</option>
                <option value="Black Cotton Soil">Black Cotton Soil (काली मिट्टी / रेगुर)</option>
                <option value="Alluvial Soil">Alluvial Soil (जलोढ़ मिट्टी)</option>
                <option value="Red Sandy Soil">Red Soil (लाल मिट्टी)</option>
              </select>
            </div>

            {/* Irrigation Method */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Irrigation System
              </label>
              <select
                value={irrigationMethod}
                onChange={(e) => setIrrigationMethod(e.target.value)}
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:bg-white focus:outline-none"
              >
                <option value="Drip & Tube-well">Drip Irrigation (टपक सिंचाई)</option>
                <option value="Sprinkler System">Sprinkler System (फव्वारा सिंचाई)</option>
                <option value="Canal / Flood">Canal / Surface Flood (नहर / खुला पानी)</option>
                <option value="Rainfed (Barani)">Rainfed / Barani (वर्षा आधारित)</option>
              </select>
            </div>

            {/* Farming Experience */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Farming Experience (Years)
              </label>
              <input
                type="number"
                value={farmingExperience}
                onChange={(e) => setFarmingExperience(e.target.value)}
                placeholder="10"
                className="w-full h-11 px-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSaving}
              className="gap-2 font-bold px-6"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Save Farm Profile</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* Danger Zone: Account Deletion */}
      <Card className="p-6 border-red-200 bg-red-50/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <h4 className="text-sm font-bold text-red-900">Danger Zone: Delete Account</h4>
            </div>
            <p className="text-xs text-red-700/80 mt-1">
              Permanently delete your farmer account and all associated saved crops, disease diagnoses, and AI chat sessions.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-700 border-red-300 hover:bg-red-100/60 font-semibold"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete Account
          </Button>
        </div>

        {/* Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-red-200 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 stroke-[2]" />
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Are you absolutely sure?
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  This action is permanent and cannot be undone. All your registered crops, irrigation logs, disease diagnosis history, and AI conversation history will be permanently deleted from the database.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete Everything"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
