"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Heart,
  Share2,
  MapPin,
  Calendar,
  CheckCircle,
  MessageSquare,
  ArrowLeft,
  Eye,
  Store,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SAMPLE_MARKETPLACE_LISTINGS } from "@/constants/sample-data";

export const MarketplacePreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"browse" | "listings" | "offers">("browse");
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedItem = SAMPLE_MARKETPLACE_LISTINGS.find(
    (item) => item.id === selectedListingId
  );

  const getCropEmoji = (name: string) => {
    switch (name.toLowerCase()) {
      case "tomato":
        return "🍅";
      case "wheat":
        return "🌾";
      case "onion":
        return "🧅";
      case "potato":
        return "🥔";
      default:
        return "🌱";
    }
  };

  return (
    <div className="space-y-6">
      {/* If Listing Detail is selected (Reference Screen 6) */}
      {selectedItem ? (
        <div className="space-y-6">
          {/* Back button */}
          <button
            onClick={() => setSelectedListingId(null)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Marketplace Catalog</span>
          </button>

          {/* Listing Details Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="green" size="sm">
                  <CheckCircle className="h-3 w-3" />
                  Verified Farmer Listing
                </Badge>
                <span className="text-xs text-slate-400">
                  Posted on {selectedItem.harvestDate}
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                {selectedItem.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => toggleFavorite(selectedItem.id, e)}
                leftIcon={
                  <Heart
                    className={`h-4 w-4 ${
                      favorites[selectedItem.id]
                        ? "fill-red-500 text-red-500"
                        : "text-slate-400"
                    }`}
                  />
                }
              >
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Share2 className="h-4 w-4 text-slate-500" />}
              >
                Share
              </Button>
              <Button variant="primary" size="sm">
                Express Interest
              </Button>
            </div>
          </div>

          {/* Two Column Layout for Detail Screen */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Images & Specifications */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="p-6">
                {/* Photo Gallery Placeholder */}
                <div className="h-64 rounded-2xl bg-gradient-to-br from-emerald-50 via-slate-100 to-amber-50 flex items-center justify-center text-7xl border border-slate-200/80 mb-4 shadow-inner">
                  {getCropEmoji(selectedItem.crop)}
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-4">
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400">
                      Price
                    </span>
                    <span className="block text-sm font-extrabold text-krishi-800">
                      ₹{selectedItem.pricePerQuintal}/Quintal
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400">
                      Quantity Available
                    </span>
                    <span className="block text-sm font-extrabold text-slate-800">
                      {selectedItem.quantityKg} kg
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400">
                      Location
                    </span>
                    <span className="block text-sm font-bold text-slate-800 truncate">
                      {selectedItem.location}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400">
                      Quality Grade
                    </span>
                    <span className="block text-sm font-bold text-slate-800">
                      {selectedItem.grade}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Produce Description
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Freshly harvested tomatoes from Ramesh Kumar&apos;s monitored farm plot in Jaipur. Graded, sorted for uniformity, packed in standard 25kg crates. Suitable for wholesale redistribution and retail.
                  </p>
                </div>
              </Card>

              {/* Buyer Interest Inquiries (Screen 6) */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-bold text-slate-900">
                    Buyer Interest
                  </h4>
                  <Badge variant="blue" size="sm">
                    3 Buyers Inquired
                  </Badge>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      name: "GreenFresh Traders",
                      qty: "500 kg",
                      type: "Wholesale",
                    },
                    {
                      name: "AgriMart Pvt. Ltd.",
                      qty: "300 kg",
                      type: "Retail Chain",
                    },
                    {
                      name: "Local Retailer",
                      qty: "200 kg",
                      type: "Local Mandi Vendor",
                    },
                  ].map((buyer, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-krishi-100 text-krishi-800 text-xs font-bold">
                          {buyer.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-slate-800">
                            {buyer.name}
                          </h5>
                          <span className="text-xs text-slate-400">
                            Interested in: {buyer.qty} • {buyer.type}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<MessageSquare className="h-3 w-3" />}
                        >
                          Message
                        </Button>
                        <Button variant="ghost" size="sm">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right: Farmer Profile Card */}
            <div className="lg:col-span-4 space-y-4">
              <Card className="p-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Farmer Information
                </h4>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-krishi-100 text-krishi-800 font-bold text-lg">
                    RK
                  </div>
                  <div>
                    <h5 className="text-base font-extrabold text-slate-900">
                      {selectedItem.farmer.name}
                    </h5>
                    <Badge variant="green" size="sm">
                      Verified Producer
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Location:</span>
                    <span className="font-semibold text-slate-700">
                      {selectedItem.location}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tenure:</span>
                    <span className="font-semibold text-slate-700">
                      Member since Oct 2024
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Completed Trades:</span>
                    <span className="font-semibold text-slate-700">14 Orders</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full justify-center">
                  View Full Profile
                </Button>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        /* Catalog View (Reference Screen 5) */
        <div className="space-y-6">
          {/* Top Bar with "+ Create Listing" Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Tab navigation */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              {[
                { id: "browse", label: "Browse Produce" },
                { id: "listings", label: "My Listings" },
                { id: "offers", label: "My Offers" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-3.5 py-1.5 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? "bg-white text-krishi-800 font-bold shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Create Listing
            </Button>
          </div>

          {/* Search & Filter Strip */}
          <Card className="p-4 bg-white border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div className="sm:col-span-2 relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search crops, location..."
                  className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none"
                />
              </div>

              <div>
                <select className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none text-slate-700">
                  <option>All Crops</option>
                  <option>Tomato</option>
                  <option>Potato</option>
                  <option>Onion</option>
                  <option>Wheat</option>
                </select>
              </div>

              <div>
                <select className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none text-slate-700">
                  <option>All Locations</option>
                  <option>Jaipur</option>
                  <option>Sanganer</option>
                  <option>Chomu</option>
                </select>
              </div>

              <div>
                <select className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none text-slate-700">
                  <option>Sort By: Latest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Quantity</option>
                </select>
              </div>
            </div>
          </Card>

          {/* 4-Column Produce Grid matching Reference Screen 5 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SAMPLE_MARKETPLACE_LISTINGS.map((listing) => (
              <Card
                key={listing.id}
                hoverable
                className="overflow-hidden p-0 border-slate-200/90 flex flex-col justify-between"
              >
                <div>
                  {/* Photo / Emoji Thumbnail Container */}
                  <div className="relative h-40 bg-gradient-to-br from-emerald-50 via-slate-100 to-amber-50 flex items-center justify-center text-5xl border-b border-slate-100">
                    <span>{getCropEmoji(listing.crop)}</span>

                    {/* Wishlist Heart */}
                    <button
                      onClick={(e) => toggleFavorite(listing.id, e)}
                      aria-label="Save to wishlist"
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-slate-400 hover:text-red-500 shadow-sm transition-all"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          favorites[listing.id]
                            ? "fill-red-500 text-red-500"
                            : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-slate-900">
                        {listing.crop}
                      </h4>
                      <span className="text-xs font-semibold text-slate-500">
                        {listing.quantityKg.toLocaleString("en-IN")} kg
                      </span>
                    </div>

                    <div className="text-base font-extrabold text-krishi-800">
                      ₹{listing.pricePerQuintal.toLocaleString("en-IN")}/Quintal
                    </div>

                    <div className="text-xs text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-slate-400 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span>{listing.location}</span>
                      </div>
                      <div className="text-slate-700 font-medium">
                        {listing.farmer.name}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="p-4 pt-0">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-center"
                    onClick={() => setSelectedListingId(listing.id)}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
