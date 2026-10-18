"use client";

import React, { useState } from "react";
import {
  X,
  MapPin,
  CheckCircle,
  MessageCircle,
  Mail,
  Phone,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Truck,
  Calendar,
  AlertCircle,
  ShoppingBag,
  Share2,
  Calculator,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { MarketplaceListingItem } from "../types";
import { getMandiBenchmark } from "../data/mandi-benchmarks";
import { useAuth } from "@/context/AuthContext";

interface ProductDetailModalProps {
  listing: MarketplaceListingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced?: () => void;
  onOpenCalculator?: (cropName: string, price: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  listing,
  isOpen,
  onClose,
  onOrderPlaced,
  onOpenCalculator,
}) => {
  const { user } = useAuth();

  const [quantity, setQuantity] = useState<number>(1);
  const [buyerName, setBuyerName] = useState(user?.name || "Kavita Sharma");
  const [buyerPhone, setBuyerPhone] = useState("+91 94140 12345");
  const [buyerWhatsapp, setBuyerWhatsapp] = useState("919414012345");
  const [buyerEmail, setBuyerEmail] = useState(user?.email || "kavita.traders@gmail.com");
  const [buyerAddress, setBuyerAddress] = useState("Shop 12, Mandi Complex, Jaipur");
  const [deliveryPreference, setDeliveryPreference] = useState("Farmgate Pickup");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);

  if (!isOpen || !listing) return null;

  const benchmark = getMandiBenchmark(listing.cropName);
  const mandiRate = benchmark?.modalPriceQuintal || null;
  const priceDiffPerQuintal = mandiRate ? listing.pricePerQuintal - mandiRate : null;

  const totalPrice = Math.round((Number(quantity) || 0) * listing.pricePerUnit);
  const isOutOfStock = listing.availableStock <= 0 || listing.status !== "ACTIVE";

  // Pre-fill WhatsApp message
  const whatsappMessage = encodeURIComponent(
    `Hello ${listing.sellerName}, I saw your listing for "${listing.title}" on AgroSaathi (Price: ₹${listing.pricePerUnit}/${listing.unit}). I am interested in purchasing. Please let me know if it is available.`
  );
  const whatsappUrl = `https://wa.me/${listing.sellerWhatsapp}?text=${whatsappMessage}`;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      setErrorMessage("Please select a quantity greater than zero.");
      return;
    }

    if (qty > listing.availableStock) {
      setErrorMessage(
        `Requested quantity (${qty} ${listing.unit}) exceeds currently available stock (${listing.availableStock} ${listing.unit}).`
      );
      return;
    }

    const cleanWhatsapp = buyerWhatsapp.replace(/\D/g, "");
    if (!cleanWhatsapp || cleanWhatsapp.length < 10) {
      setErrorMessage("Please enter a valid WhatsApp number (minimum 10 digits).");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/marketplace/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          buyerId: user?.id || `buyer-${Date.now()}`,
          buyerName: buyerName.trim(),
          buyerPhone: buyerPhone.trim(),
          buyerWhatsapp: cleanWhatsapp,
          buyerEmail: buyerEmail.trim() || undefined,
          buyerAddress: buyerAddress.trim() || undefined,
          quantityRequested: qty,
          deliveryPreference,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to submit purchase request");
      }

      setSuccessOrder(data.data.order);
      if (onOrderPlaced) onOrderPlaced();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-krishi-800 to-krishi-900 text-white">
          <div className="flex items-center gap-3">
            <Badge variant="live" size="sm">
              <CheckCircle className="h-3 w-3" />
              Verified Produce Listing
            </Badge>
            {listing.isDemoSeed && (
              <span className="text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded-full text-krishi-100">
                Sample Reference Listing
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Grid: Left Spec & Imagery / Right Order Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Columns: Product Specs, Mandi Benchmark & Seller Contact */}
            <div className="lg:col-span-7 space-y-5">
              {/* Image banner */}
              <div className="h-52 rounded-2xl bg-gradient-to-br from-emerald-50 via-slate-50 to-amber-50 border border-slate-200/90 flex items-center justify-center relative overflow-hidden shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={listing.images[0] || "/icons/crop-tomato.svg"}
                  alt={listing.title}
                  className="h-36 w-36 object-contain"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="green" size="sm">
                    {listing.category}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge variant={listing.availableStock > 0 ? "live" : "red"} size="sm">
                    {listing.availableStock > 0
                      ? `${listing.availableStock} ${listing.unit} Available`
                      : "Sold Out"}
                  </Badge>
                </div>
              </div>

              {/* Title & Location */}
              <div>
                <h3 className="text-2xl font-black text-slate-900 leading-tight">
                  {listing.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <MapPin className="h-3.5 w-3.5 text-krishi-600" />
                    {listing.location}
                  </span>
                  <span>•</span>
                  <span>Harvested: {listing.harvestDate || "Fresh"}</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-700">{listing.grade}</span>
                </div>
              </div>

              {/* Description */}
              {listing.description && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {listing.description}
                </div>
              )}

              {/* Specification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="block text-[11px] font-semibold text-slate-400">Asking Price</span>
                  <span className="block text-base font-extrabold text-krishi-800">
                    ₹{listing.pricePerUnit.toLocaleString("en-IN")}/{listing.unit}
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    (₹{listing.pricePerQuintal.toLocaleString("en-IN")}/Q)
                  </span>
                </div>

                <div>
                  <span className="block text-[11px] font-semibold text-slate-400">Remaining Stock</span>
                  <span className="block text-base font-extrabold text-slate-800">
                    {listing.availableStock} {listing.unit}
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    of {listing.totalStock} {listing.unit}
                  </span>
                </div>

                <div>
                  <span className="block text-[11px] font-semibold text-slate-400">Quality Grade</span>
                  <span className="block text-sm font-bold text-slate-800 truncate">
                    {listing.grade}
                  </span>
                </div>

                <div>
                  <span className="block text-[11px] font-semibold text-slate-400">Logistics</span>
                  <span className="block text-xs font-bold text-slate-700 truncate" title={listing.pickupDelivery}>
                    {listing.pickupDelivery}
                  </span>
                </div>
              </div>

              {/* Mandi Benchmark Price Comparison Strip */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                      APMC Mandi Modal Reference
                    </span>
                    <Badge variant="amber" size="sm">
                      Benchmark
                    </Badge>
                  </div>
                  {onOpenCalculator && (
                    <button
                      type="button"
                      onClick={() => onOpenCalculator(listing.cropName, listing.pricePerQuintal)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-krishi-700 hover:text-krishi-800 underline"
                    >
                      <Calculator className="h-3.5 w-3.5" />
                      <span>Profit Calculator</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-700">
                  <span>
                    Nearest APMC Rate:{" "}
                    <strong>
                      ₹{mandiRate ? mandiRate.toLocaleString("en-IN") : "1,850"}/Quintal
                    </strong>{" "}
                    ({benchmark ? benchmark.mandiName : "Jaipur Mandi"})
                  </span>
                  {priceDiffPerQuintal !== null && (
                    <span
                      className={`font-bold inline-flex items-center gap-1 ${
                        priceDiffPerQuintal <= 0 ? "text-emerald-700" : "text-amber-700"
                      }`}
                    >
                      {priceDiffPerQuintal <= 0 ? (
                        <>
                          <TrendingDown className="h-3.5 w-3.5" />
                          <span>₹{Math.abs(priceDiffPerQuintal)}/Q below Mandi rate (Direct value)</span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span>₹{priceDiffPerQuintal}/Q farmer premium</span>
                        </>
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Direct Seller Contact Details Section */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-krishi-100 text-krishi-800 font-bold">
                      {listing.sellerName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {listing.sellerName}
                      </h4>
                      <span className="text-xs text-slate-400">
                        Producer • {listing.district}, {listing.state}
                      </span>
                    </div>
                  </div>
                  <Badge variant="green" size="sm">
                    <ShieldCheck className="h-3 w-3" />
                    Verified Farmer
                  </Badge>
                </div>

                {/* Direct Action Buttons: WhatsApp & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Chat on WhatsApp</span>
                  </a>

                  {listing.sellerEmail ? (
                    <a
                      href={`mailto:${listing.sellerEmail}?subject=${encodeURIComponent(
                        `Inquiry for ${listing.title} on AgroSaathi`
                      )}`}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors"
                    >
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="truncate">{listing.sellerEmail}</span>
                    </a>
                  ) : (
                    <div className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 text-slate-400 text-xs rounded-xl border border-slate-200">
                      <Mail className="h-4 w-4" />
                      <span>Email not specified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Interactive Quantity Selection & Purchase Request Form */}
            <div className="lg:col-span-5">
              <Card className="p-5 border-slate-200 h-full flex flex-col justify-between">
                {successOrder ? (
                  /* Success View */
                  <div className="py-8 text-center space-y-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900">
                        Purchase Request Placed!
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                        Your request for{" "}
                        <strong>
                          {successOrder.quantityRequested} {successOrder.unit}
                        </strong>{" "}
                        (₹{successOrder.totalPrice.toLocaleString("en-IN")}) has been sent to{" "}
                        <strong>{listing.sellerName}</strong>.
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1 text-left">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Order ID:</span>
                        <span className="font-mono font-semibold">{successOrder.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status:</span>
                        <Badge variant="amber" size="sm">
                          {successOrder.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Coordinate Directly on WhatsApp</span>
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center"
                        onClick={onClose}
                      >
                        Return to Catalog
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Form View */
                  <form onSubmit={handleSubmitOrder} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-base font-extrabold text-slate-900">
                          Place Purchase Request
                        </h4>
                        <span className="text-xs text-slate-400">Direct trade transaction</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-xs font-semibold text-slate-400">Unit Price</span>
                        <span className="block text-base font-black text-krishi-800">
                          ₹{listing.pricePerUnit.toLocaleString("en-IN")}/{listing.unit}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Required Quantity ({listing.unit})
                        </label>
                        <span className="text-[11px] font-semibold text-slate-400">
                          Max: {listing.availableStock} {listing.unit}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="any"
                          min="0.1"
                          max={listing.availableStock}
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                          disabled={isOutOfStock}
                          className="w-full h-11 px-3 text-base font-extrabold bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => setQuantity(listing.availableStock)}
                          disabled={isOutOfStock}
                          className="px-3 h-11 bg-slate-100 hover:bg-emerald-100 text-xs font-bold text-slate-700 hover:text-krishi-800 rounded-xl transition-colors shrink-0"
                        >
                          Max
                        </button>
                      </div>

                      {/* Quick qty increment buttons */}
                      <div className="flex items-center gap-1.5 mt-2">
                        {[0.5, 1, 2, 5].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            disabled={isOutOfStock || amt > listing.availableStock}
                            onClick={() => setQuantity(amt)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-krishi-800 font-semibold transition-colors disabled:opacity-40"
                          >
                            {amt} {listing.unit}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Total Calculated Price Banner */}
                    <div className="p-3.5 bg-krishi-50 border border-krishi-200 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-krishi-800 block">
                          Calculated Total Price
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {quantity} {listing.unit} × ₹{listing.pricePerUnit.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-krishi-900">
                          ₹{totalPrice.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Buyer Contact Fields */}
                    <div className="space-y-2.5 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Your Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={buyerName}
                          onChange={(e) => setBuyerName(e.target.value)}
                          placeholder="e.g. Kavita Sharma"
                          className="w-full h-9 px-3 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Your WhatsApp <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={buyerWhatsapp}
                            onChange={(e) => setBuyerWhatsapp(e.target.value)}
                            placeholder="9414012345"
                            className="w-full h-9 px-3 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Email <span className="text-slate-400 font-normal">(Optional)</span>
                          </label>
                          <input
                            type="email"
                            value={buyerEmail}
                            onChange={(e) => setBuyerEmail(e.target.value)}
                            placeholder="kavita@traders.com"
                            className="w-full h-9 px-3 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Delivery / Pickup Preference
                        </label>
                        <select
                          value={deliveryPreference}
                          onChange={(e) => setDeliveryPreference(e.target.value)}
                          className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none text-slate-800"
                        >
                          <option value="Farmgate Pickup">Farmgate Pickup (I arrange transport)</option>
                          <option value="Seller Delivery Available">Request Delivery to My Address</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Destination Address / Mandi Shop
                        </label>
                        <input
                          type="text"
                          value={buyerAddress}
                          onChange={(e) => setBuyerAddress(e.target.value)}
                          placeholder="e.g. Shop 12, APMC Mandi, Jaipur"
                          className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Special Note for Seller
                        </label>
                        <input
                          type="text"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Preferred delivery time, crate requirements..."
                          className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Error display */}
                    {errorMessage && (
                      <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={isOutOfStock}
                      isLoading={isSubmitting}
                      className="w-full justify-center"
                      leftIcon={<ShoppingBag className="h-4 w-4" />}
                    >
                      {isOutOfStock ? "Out of Stock" : `Send Purchase Request (₹${totalPrice.toLocaleString("en-IN")})`}
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
