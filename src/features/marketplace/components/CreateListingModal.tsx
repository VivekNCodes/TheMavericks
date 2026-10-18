"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  MarketplaceListingItem,
  ProduceUnit,
  ProduceCategory,
  QualityGrade,
} from "../types";
import { useAuth } from "@/context/AuthContext";
import { getMandiBenchmark } from "../data/mandi-benchmarks";

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialListing?: MarketplaceListingItem | null;
}

const CATEGORIES: ProduceCategory[] = [
  "Vegetables",
  "Grains & Cereals",
  "Fruits",
  "Pulses",
  "Spices",
  "Oilseeds",
];

const QUALITY_GRADES: QualityGrade[] = [
  "A Grade (Premium)",
  "B Grade (Standard)",
  "Organic Certified",
  "FAQ Standard",
];

const CROP_PRESETS = [
  { name: "Tomato", category: "Vegetables", icon: "/icons/crop-tomato.svg" },
  { name: "Wheat", category: "Grains & Cereals", icon: "/icons/crop-wheat.svg" },
  { name: "Potato", category: "Vegetables", icon: "/icons/crop-potato.svg" },
  { name: "Onion", category: "Vegetables", icon: "/icons/crop-onion.svg" },
  { name: "Mustard", category: "Oilseeds", icon: "/icons/crop-mustard.svg" },
  { name: "Chili", category: "Vegetables", icon: "/icons/crop-chili.svg" },
];

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialListing,
}) => {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [cropName, setCropName] = useState("Tomato");
  const [category, setCategory] = useState<ProduceCategory>("Vegetables");
  const [variety, setVariety] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState<ProduceUnit>("quintal");
  const [pricePerUnit, setPricePerUnit] = useState<number | "">(1800);
  const [totalStock, setTotalStock] = useState<number | "">(5);
  const [grade, setGrade] = useState<QualityGrade>("A Grade (Premium)");
  const [state, setState] = useState("Rajasthan");
  const [district, setDistrict] = useState("Jaipur");
  const [village, setVillage] = useState("Amer Tehsil");
  const [pickupDelivery, setPickupDelivery] = useState(
    "Farmgate Pickup & Seller Delivery Available"
  );
  const [sellerName, setSellerName] = useState(user?.name || "Ramesh Kumar");
  const [sellerPhone, setSellerPhone] = useState("+91 98290 12345");
  const [sellerWhatsapp, setSellerWhatsapp] = useState("919829012345");
  const [sellerEmail, setSellerEmail] = useState(user?.email || "ramesh.kumar.farmer@gmail.com");
  const [images, setImages] = useState<string[]>(["/icons/crop-tomato.svg"]);

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialListing) {
      setTitle(initialListing.title);
      setCropName(initialListing.cropName);
      setCategory((initialListing.category as ProduceCategory) || "Vegetables");
      setVariety(initialListing.variety || "");
      setDescription(initialListing.description || "");
      setUnit(initialListing.unit);
      setPricePerUnit(initialListing.pricePerUnit);
      setTotalStock(initialListing.totalStock);
      setGrade((initialListing.grade as QualityGrade) || "A Grade (Premium)");
      setState(initialListing.state);
      setDistrict(initialListing.district);
      setVillage(initialListing.village || "");
      setPickupDelivery(initialListing.pickupDelivery);
      setSellerName(initialListing.sellerName);
      setSellerPhone(initialListing.sellerPhone);
      setSellerWhatsapp(initialListing.sellerWhatsapp);
      setSellerEmail(initialListing.sellerEmail || "");
      setImages(initialListing.images.length > 0 ? initialListing.images : ["/icons/crop-tomato.svg"]);
    } else {
      setTitle("Fresh Farmgate Hybrid Tomatoes");
      setCropName("Tomato");
      setCategory("Vegetables");
      setVariety("Abhinav F1");
      setDescription("Grade-A freshly harvested produce sorted for wholesale and retail buyers.");
      setUnit("quintal");
      setPricePerUnit(1800);
      setTotalStock(5);
      setGrade("A Grade (Premium)");
      setState("Rajasthan");
      setDistrict("Jaipur");
      setVillage("Amer Tehsil");
      setPickupDelivery("Farmgate Pickup & Seller Delivery Available");
      setSellerName(user?.name || "Ramesh Kumar");
      setSellerPhone("+91 98290 12345");
      setSellerWhatsapp("919829012345");
      setSellerEmail(user?.email || "ramesh.kumar.farmer@gmail.com");
      setImages(["/icons/crop-tomato.svg"]);
    }
    setErrorMessage(null);
    setValidationErrors({});
  }, [initialListing, isOpen, user]);

  if (!isOpen) return null;

  const mandiBenchmark = getMandiBenchmark(cropName);

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrorMessage("Please upload a valid JPEG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image file exceeds the 5MB size limit.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/marketplace/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Upload failed");
      }

      setImages([data.data.url]);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!title.trim() || title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters long.";
    }

    if (!cropName.trim()) {
      errors.cropName = "Crop name is required.";
    }

    if (pricePerUnit === "" || Number(pricePerUnit) <= 0) {
      errors.pricePerUnit = "Price must be greater than zero.";
    }

    if (totalStock === "" || Number(totalStock) <= 0) {
      errors.totalStock = "Stock quantity must be greater than zero.";
    }

    const cleanWhatsapp = sellerWhatsapp.replace(/\D/g, "");
    if (!cleanWhatsapp || cleanWhatsapp.length < 10) {
      errors.sellerWhatsapp = "Valid WhatsApp number is required (min 10 digits).";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      userId: user?.id || "google-10982348234",
      title: title.trim(),
      cropName: cropName.trim(),
      category,
      variety: variety.trim() || undefined,
      description: description.trim() || undefined,
      unit,
      pricePerUnit: Number(pricePerUnit),
      totalStock: Number(totalStock),
      grade,
      state: state.trim(),
      district: district.trim(),
      village: village.trim() || undefined,
      pickupDelivery,
      sellerName: sellerName.trim(),
      sellerPhone: sellerPhone.trim(),
      sellerWhatsapp: sellerWhatsapp.replace(/\D/g, ""),
      sellerEmail: sellerEmail.trim() || undefined,
      images: images.length > 0 ? images : ["/icons/crop-tomato.svg"],
    };

    try {
      let res: Response;
      if (initialListing) {
        res = await fetch(`/api/marketplace/listings/${initialListing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/marketplace/listings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to save listing");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong while saving listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-krishi-700 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">
                {initialListing ? "Edit Produce Listing" : "List Harvest Produce for Sale"}
              </h3>
              <p className="text-xs text-krishi-100">
                Direct Farmer-to-Buyer Agri-Commerce Gateway
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700 font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* Section 1: Crop & Listing Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-krishi-800 border-b border-slate-200 pb-1.5">
              1. Produce Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Crop Name <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={cropName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCropName(val);
                      const preset = CROP_PRESETS.find((p) => p.name === val);
                      if (preset) {
                        setCategory(preset.category as ProduceCategory);
                        setImages([preset.icon]);
                        setTitle(`Fresh Harvest ${val}`);
                      }
                    }}
                    className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none font-bold text-slate-800"
                  >
                    <option value="Tomato">Tomato (टमाटर)</option>
                    <option value="Wheat">Wheat (गेहूं)</option>
                    <option value="Potato">Potato (आलू)</option>
                    <option value="Onion">Onion (प्याज)</option>
                    <option value="Mustard">Mustard (सरसों)</option>
                    <option value="Chili">Chili (मिर्च)</option>
                    <option value="Soybean">Soybean (सोयाबीन)</option>
                    <option value="Garlic">Garlic (लहसुन)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Produce Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProduceCategory)}
                  className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none text-slate-800"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Listing Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fresh Farmgate Hybrid Tomatoes - High Quality"
                className={`w-full h-10 px-3.5 text-sm bg-white border rounded-xl focus:border-krishi-500 focus:outline-none ${
                  validationErrors.title ? "border-red-400" : "border-slate-200"
                }`}
              />
              {validationErrors.title && (
                <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Variety / Cultivar
                </label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. Abhinav F1, Sharbati, Kufri Pukhraj"
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quality Grade <span className="text-red-500">*</span>
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as QualityGrade)}
                  className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none text-slate-800"
                >
                  {QUALITY_GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description & Produce Notes
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details on harvest date, grading, packaging crates, moisture levels..."
                className="w-full p-3 text-sm bg-white border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Section 2: Pricing, Units & Available Stock */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-krishi-800 border-b border-slate-200 pb-1.5">
              2. Quantity & Transparent Pricing
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Measurement Unit <span className="text-red-500">*</span>
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as ProduceUnit)}
                  className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none font-bold text-slate-800"
                >
                  <option value="quintal">Quintal (100 kg)</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="tonne">Tonne (1,000 kg)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Available Stock ({unit}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  value={totalStock}
                  onChange={(e) => setTotalStock(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 5"
                  className={`w-full h-10 px-3 text-sm bg-white border rounded-xl focus:border-krishi-500 focus:outline-none font-bold text-slate-800 ${
                    validationErrors.totalStock ? "border-red-400" : "border-slate-200"
                  }`}
                />
                {validationErrors.totalStock && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.totalStock}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asking Price (₹ per {unit}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 1800"
                  className={`w-full h-10 px-3 text-sm bg-white border rounded-xl focus:border-krishi-500 focus:outline-none font-extrabold text-krishi-800 ${
                    validationErrors.pricePerUnit ? "border-red-400" : "border-slate-200"
                  }`}
                />
                {validationErrors.pricePerUnit && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.pricePerUnit}</p>
                )}
              </div>
            </div>

            {/* Mandi Benchmark Price Comparison Hint */}
            {mandiBenchmark && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs flex items-center justify-between">
                <span className="text-amber-900 font-medium">
                  <strong>APMC Mandi Modal Benchmark:</strong> ₹{mandiBenchmark.modalPriceQuintal}/Quintal ({mandiBenchmark.mandiName})
                </span>
                <span className="font-semibold text-amber-800">
                  Approx. ₹{mandiBenchmark.pricePerKg}/kg
                </span>
              </div>
            )}
          </div>

          {/* Section 3: Location & Delivery Preferences */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-krishi-800 border-b border-slate-200 pb-1.5">
              3. Farm Location & Logistics
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  State
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none text-slate-800"
                >
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  District
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none text-slate-800"
                >
                  <option value="Jaipur">Jaipur</option>
                  <option value="Alwar">Alwar</option>
                  <option value="Kota">Kota</option>
                  <option value="Jodhpur">Jodhpur</option>
                  <option value="Bikaner">Bikaner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Village / Tehsil
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="e.g. Amer Tehsil, Deoli"
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pickup & Delivery Preference
              </label>
              <select
                value={pickupDelivery}
                onChange={(e) => setPickupDelivery(e.target.value)}
                className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none text-slate-800"
              >
                <option value="Farmgate Pickup & Seller Delivery Available">
                  Farmgate Pickup & Seller Delivery Available
                </option>
                <option value="Farmgate Pickup Only">
                  Farmgate Pickup Only (Buyer arranges transport)
                </option>
                <option value="Seller Delivery Available">
                  Seller Delivery to Mandi / Buyer Location
                </option>
              </select>
            </div>
          </div>

          {/* Section 4: Seller Direct Contact Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-krishi-800 border-b border-slate-200 pb-1.5">
              4. Direct Seller Contact Details (For Buyer Coordination)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Seller WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={sellerWhatsapp}
                    onChange={(e) => setSellerWhatsapp(e.target.value)}
                    placeholder="e.g. 9829012345"
                    className={`w-full h-10 px-3.5 text-sm bg-white border rounded-xl focus:border-krishi-500 focus:outline-none font-bold text-slate-800 ${
                      validationErrors.sellerWhatsapp ? "border-red-400" : "border-slate-200"
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Used by interested buyers for 1-click WhatsApp messaging and deal confirmation.
                </p>
                {validationErrors.sellerWhatsapp && (
                  <p className="text-xs text-red-500 mt-1 font-medium">{validationErrors.sellerWhatsapp}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Seller Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={sellerEmail}
                  onChange={(e) => setSellerEmail(e.target.value)}
                  placeholder="e.g. ramesh.kumar.farmer@gmail.com"
                  className="w-full h-10 px-3.5 text-sm bg-white border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Optional email for receiving purchase inquiries and order updates.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Photos & Imagery */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-krishi-800 border-b border-slate-200 pb-1.5">
              5. Produce Photo / Visuals
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Photo preview container */}
              <div className="sm:col-span-4 flex flex-col items-center justify-center h-32 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden relative shadow-inner">
                {images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={images[0]}
                    alt="Produce preview"
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <ImageIcon className="h-10 w-10 text-slate-300" />
                )}
              </div>

              {/* Upload actions */}
              <div className="sm:col-span-8 space-y-2">
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-krishi-400 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 transition-all">
                  <UploadCloud className="h-6 w-6 text-krishi-600 mb-1" />
                  <span className="text-xs font-bold text-slate-700">
                    {isUploading ? "Uploading..." : "Upload Real Produce Photo"}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    JPG, PNG, WEBP (Max 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>

                {/* Quick Presets Strip */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400">Presets:</span>
                  {CROP_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setImages([preset.icon])}
                      className="text-xs px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-100 hover:text-krishi-800 transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              leftIcon={<CheckCircle className="h-4 w-4" />}
            >
              {initialListing ? "Save Listing Changes" : "Publish Listing Now"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
