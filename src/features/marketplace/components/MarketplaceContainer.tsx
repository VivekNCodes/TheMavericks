"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Filter,
  RefreshCw,
  Calculator,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Package,
  Layers,
  ShoppingBag,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  MarketplaceListingItem,
  MarketplaceOrderItem,
  MarketplaceFilter,
} from "../types";
import { getMandiBenchmark } from "../data/mandi-benchmarks";
import { ProductDetailModal } from "./ProductDetailModal";
import { CreateListingModal } from "./CreateListingModal";
import { ProfitCalculatorModal } from "./ProfitCalculatorModal";
import { MyListingsView } from "./MyListingsView";
import { MyOrdersView } from "./MyOrdersView";
import { useAuth } from "@/context/AuthContext";

export const MarketplaceContainer: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"browse" | "listings" | "orders">("browse");
  const [listings, setListings] = useState<MarketplaceListingItem[]>([]);
  const [orders, setOrders] = useState<MarketplaceOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All Locations");
  const [selectedGrade, setSelectedGrade] = useState("All Grades");
  const [sortBy, setSortBy] = useState("latest");

  // Favorites
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Modals
  const [selectedListing, setSelectedListing] = useState<MarketplaceListingItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<MarketplaceListingItem | null>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [calculatorCrop, setCalculatorCrop] = useState("Tomato");
  const [calculatorPrice, setCalculatorPrice] = useState(1800);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchListingsAndOrders = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    setFetchError(null);

    try {
      const effectiveUserId = user?.id || "google-10982348234";
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("q", searchQuery.trim());
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (selectedDistrict !== "All Locations") params.append("district", selectedDistrict);
      if (selectedGrade !== "All Grades") params.append("grade", selectedGrade);
      if (sortBy) params.append("sortBy", sortBy);

      const [listingsRes, ordersRes] = await Promise.all([
        fetch(`/api/marketplace/listings?${params.toString()}`),
        fetch(`/api/marketplace/orders?userId=${encodeURIComponent(effectiveUserId)}`),
      ]);

      const listingsData = await listingsRes.json();
      const ordersData = await ordersRes.json();

      if (listingsData.success) {
        setListings(listingsData.data.listings || []);
      } else {
        throw new Error(listingsData.error?.message || "Failed to load listings");
      }

      if (ordersData.success) {
        setOrders(ordersData.data.orders || []);
      }
    } catch (err: any) {
      console.error("Marketplace fetch error:", err);
      setFetchError(err.message || "Could not fetch marketplace data.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery, selectedCategory, selectedDistrict, selectedGrade, sortBy, user]);

  useEffect(() => {
    fetchListingsAndOrders();
  }, [fetchListingsAndOrders]);

  const handleOpenDetail = (listing: MarketplaceListingItem) => {
    setSelectedListing(listing);
    setIsDetailOpen(true);
  };

  const handleOpenEdit = (listing: MarketplaceListingItem) => {
    setEditingListing(listing);
    setIsCreateOpen(true);
  };

  const handleOpenCalculator = (crop = "Tomato", price = 1800) => {
    setCalculatorCrop(crop);
    setCalculatorPrice(price);
    setIsCalculatorOpen(true);
  };

  // Filter listings for "My Listings" tab (matching user ID or demo farmer)
  const currentUserId = user?.id || "google-10982348234";
  const myListings = listings.filter(
    (l) => l.userId === currentUserId || l.userId.startsWith("google-") || l.sellerName === user?.name
  );
  const myIncomingOrders = orders.filter(
    (o) => o.sellerId === currentUserId || o.sellerId.startsWith("google-")
  );
  const myBuyerOrders = orders.filter(
    (o) => o.buyerId === currentUserId || o.buyerId?.startsWith("buyer-") || o.buyerName === user?.name
  );

  return (
    <div className="space-y-6">
      {/* Top Bar with Navigation Tabs & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tab Navigation */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl text-xs font-semibold shadow-inner">
          {[
            { id: "browse", label: "Browse Produce", badge: listings.length },
            { id: "listings", label: "My Listings & Stock", badge: myListings.length },
            { id: "orders", label: "My Purchase Requests", badge: myBuyerOrders.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                activeTab === tab.id
                  ? "bg-white text-krishi-800 font-bold shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.badge === "number" && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === tab.id
                      ? "bg-krishi-100 text-krishi-800"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenCalculator("Tomato", 1800)}
            leftIcon={<Calculator className="h-4 w-4 text-krishi-700" />}
          >
            Profit Calculator
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingListing(null);
              setIsCreateOpen(true);
            }}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create Listing
          </Button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "browse" && (
        <div className="space-y-6">
          {/* Search & Filter Strip */}
          <Card className="p-4 bg-white border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              {/* Search Bar */}
              <div className="sm:col-span-4 relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search crops, variety, location, farmer..."
                  className="w-full h-10 pl-10 pr-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none"
                />
              </div>

              {/* Category Dropdown */}
              <div className="sm:col-span-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none text-slate-700 font-medium"
                >
                  <option value="All">All Categories</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Grains & Cereals">Grains & Cereals</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Pulses">Pulses</option>
                  <option value="Oilseeds">Oilseeds</option>
                  <option value="Spices">Spices</option>
                </select>
              </div>

              {/* District Dropdown */}
              <div className="sm:col-span-2">
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none text-slate-700 font-medium"
                >
                  <option value="All Locations">All Locations</option>
                  <option value="Jaipur">Jaipur</option>
                  <option value="Alwar">Alwar</option>
                  <option value="Kota">Kota</option>
                  <option value="Jodhpur">Jodhpur</option>
                  <option value="Bikaner">Bikaner</option>
                </select>
              </div>

              {/* Quality Grade Dropdown */}
              <div className="sm:col-span-2">
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none text-slate-700 font-medium"
                >
                  <option value="All Grades">All Grades</option>
                  <option value="A Grade (Premium)">A Grade (Premium)</option>
                  <option value="B Grade (Standard)">B Grade (Standard)</option>
                  <option value="Organic Certified">Organic Certified</option>
                  <option value="FAQ Standard">FAQ Standard</option>
                </select>
              </div>

              {/* Sort By Dropdown */}
              <div className="sm:col-span-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none text-slate-700 font-medium"
                >
                  <option value="latest">Sort: Latest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="stock_desc">Highest Stock</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Error Banner */}
          {fetchError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-medium flex items-center justify-between">
              <span>{fetchError}</span>
              <Button variant="outline" size="sm" onClick={() => fetchListingsAndOrders()}>
                Retry
              </Button>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-8">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-72 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"
                />
              ))}
            </div>
          ) : listings.length === 0 ? (
            /* Empty State */
            <Card className="p-12 text-center bg-slate-50 border-dashed border-2 border-slate-200 space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-krishi-100 text-krishi-800">
                <Store className="h-7 w-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  No Produce Listings Matched
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Try adjusting your search query, location filter, or category selection to find available crops.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedDistrict("All Locations");
                  setSelectedGrade("All Grades");
                }}
              >
                Clear All Filters
              </Button>
            </Card>
          ) : (
            /* 4-Column Produce Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {listings.map((listing) => {
                const benchmark = getMandiBenchmark(listing.cropName);
                const mandiRate = benchmark ? benchmark.modalPriceQuintal : null;
                const isSaved = favorites[listing.id];

                return (
                  <Card
                    key={listing.id}
                    hoverable
                    onClick={() => handleOpenDetail(listing)}
                    className="overflow-hidden p-0 border-slate-200/90 flex flex-col justify-between cursor-pointer group"
                  >
                    <div>
                      {/* Thumbnail Container */}
                      <div className="relative h-44 bg-gradient-to-br from-emerald-50 via-slate-100 to-amber-50 flex items-center justify-center border-b border-slate-100 p-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={listing.images[0] || "/icons/crop-tomato.svg"}
                          alt={listing.title}
                          className="h-28 w-28 object-contain transition-transform duration-200 group-hover:scale-105"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex items-center gap-1">
                          <Badge variant="green" size="sm">
                            {listing.category}
                          </Badge>
                          {listing.isDemoSeed && (
                            <span className="text-[10px] font-bold bg-slate-900/70 text-white px-2 py-0.5 rounded-full backdrop-blur-xs">
                              Sample
                            </span>
                          )}
                        </div>

                        {/* Wishlist Heart */}
                        <button
                          onClick={(e) => toggleFavorite(listing.id, e)}
                          aria-label="Save to wishlist"
                          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-slate-400 hover:text-red-500 shadow-sm transition-all"
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              isSaved ? "fill-red-500 text-red-500" : ""
                            }`}
                          />
                        </button>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 space-y-2.5">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-krishi-800 transition-colors line-clamp-1">
                            {listing.title}
                          </h4>
                        </div>

                        {/* Price & Unit */}
                        <div className="flex items-baseline justify-between">
                          <div className="text-base font-black text-krishi-800">
                            ₹{listing.pricePerUnit.toLocaleString("en-IN")}/
                            <span className="text-xs font-semibold text-slate-600">
                              {listing.unit}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-700">
                            {listing.availableStock} {listing.unit} left
                          </span>
                        </div>

                        {/* Mandi Benchmark Price Comparison */}
                        {mandiRate && (
                          <div className="p-2 bg-amber-50/70 border border-amber-200/70 rounded-xl text-[11px] text-amber-900 flex items-center justify-between">
                            <span className="font-semibold">Mandi: ₹{mandiRate}/Q</span>
                            <span className="font-bold text-krishi-800">
                              Direct Farmgate
                            </span>
                          </div>
                        )}

                        {/* Location and Farmer */}
                        <div className="text-xs text-slate-500 space-y-0.5 pt-1.5 border-t border-slate-100">
                          <div className="flex items-center gap-1 text-slate-400 truncate">
                            <MapPin className="h-3 w-3 shrink-0 text-krishi-600" />
                            <span className="truncate">{listing.location}</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-700 font-medium">
                            <span className="truncate">{listing.sellerName}</span>
                            <Badge variant="live" size="sm">
                              Verified
                            </Badge>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(listing);
                        }}
                      >
                        View Details & Buy
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: My Listings & Stock Management (Seller) */}
      {activeTab === "listings" && (
        <MyListingsView
          listings={myListings}
          orders={myIncomingOrders}
          onCreateListing={() => {
            setEditingListing(null);
            setIsCreateOpen(true);
          }}
          onEditListing={handleOpenEdit}
          onRefresh={() => fetchListingsAndOrders(true)}
          onViewDetails={handleOpenDetail}
        />
      )}

      {/* Tab: My Orders (Buyer tracking) */}
      {activeTab === "orders" && (
        <MyOrdersView
          orders={myBuyerOrders}
          onRefresh={() => fetchListingsAndOrders(true)}
          onBrowseProduce={() => setActiveTab("browse")}
        />
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        listing={selectedListing}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedListing(null);
        }}
        onOrderPlaced={() => fetchListingsAndOrders(true)}
        onOpenCalculator={handleOpenCalculator}
      />

      {/* Create / Edit Listing Modal */}
      <CreateListingModal
        isOpen={isCreateOpen}
        initialListing={editingListing}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingListing(null);
        }}
        onSuccess={() => fetchListingsAndOrders(true)}
      />

      {/* Profit Calculator Modal */}
      <ProfitCalculatorModal
        isOpen={isCalculatorOpen}
        cropName={calculatorCrop}
        defaultPricePerQuintal={calculatorPrice}
        defaultQuantityQuintal={10}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </div>
  );
};
