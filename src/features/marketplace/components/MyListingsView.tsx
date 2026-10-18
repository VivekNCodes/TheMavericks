"use client";

import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  PauseCircle,
  PlayCircle,
  Eye,
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Package,
  Layers,
  AlertCircle,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  MarketplaceListingItem,
  MarketplaceOrderItem,
  OrderStatus,
} from "../types";
import { useAuth } from "@/context/AuthContext";

interface MyListingsViewProps {
  listings: MarketplaceListingItem[];
  orders: MarketplaceOrderItem[];
  onCreateListing: () => void;
  onEditListing: (listing: MarketplaceListingItem) => void;
  onRefresh: () => void;
  onViewDetails: (listing: MarketplaceListingItem) => void;
}

export const MyListingsView: React.FC<MyListingsViewProps> = ({
  listings,
  orders,
  onCreateListing,
  onEditListing,
  onRefresh,
  onViewDetails,
}) => {
  const { user } = useAuth();
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Toggle listing active/pause
  const handleTogglePause = async (listing: MarketplaceListingItem) => {
    setLoadingActionId(listing.id);
    setErrorMessage(null);
    const newStatus = listing.status === "ACTIVE" ? "PAUSED" : "ACTIVE";

    try {
      const res = await fetch(`/api/marketplace/listings/${listing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || listing.userId,
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to update listing status");
      }

      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to change listing status");
    } finally {
      setLoadingActionId(null);
    }
  };

  // Delete listing
  const handleDelete = async (listing: MarketplaceListingItem) => {
    if (!confirm(`Are you sure you want to remove listing "${listing.title}"?`)) {
      return;
    }

    setLoadingActionId(listing.id);
    setErrorMessage(null);

    try {
      const effectiveUserId = user?.id || listing.userId;
      const res = await fetch(
        `/api/marketplace/listings/${listing.id}?userId=${encodeURIComponent(effectiveUserId)}`,
        { method: "DELETE" }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to remove listing");
      }

      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete listing");
    } finally {
      setLoadingActionId(null);
    }
  };

  // Update order status (Accept / Reject / Complete)
  const handleOrderStatusUpdate = async (
    orderId: string,
    newStatus: OrderStatus,
    note?: string
  ) => {
    setLoadingActionId(orderId);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/marketplace/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "google-10982348234",
          newStatus,
          actorRole: "seller",
          note: note || `Order marked as ${newStatus} by seller.`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to update order");
      }

      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update order status");
    } finally {
      setLoadingActionId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Notification */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Section 1: Active Listings Management */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Your Published Produce Listings
            </h3>
            <p className="text-xs text-slate-400">
              Manage inventory stock, pause/activate, or edit asking rates
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={onCreateListing}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create New Listing
          </Button>
        </div>

        {listings.length === 0 ? (
          <Card className="p-8 text-center bg-slate-50 border-dashed border-2 border-slate-200 space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-krishi-100 text-krishi-800">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800">
                No Produce Listings Published Yet
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                List your freshly harvested crop directly to connect with wholesale traders and retail buyers with zero commission.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={onCreateListing}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Publish First Listing
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => {
              const stockPercent =
                listing.totalStock > 0
                  ? Math.max(0, Math.min(100, (listing.availableStock / listing.totalStock) * 100))
                  : 0;

              return (
                <Card
                  key={listing.id}
                  className="p-5 border-slate-200 flex flex-col justify-between hover:border-krishi-300 transition-all"
                >
                  <div className="space-y-3">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={listing.images[0] || "/icons/crop-tomato.svg"}
                          alt={listing.title}
                          className="h-9 w-9 object-contain"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                            {listing.title}
                          </h4>
                          <span className="text-xs text-slate-400">
                            {listing.cropName} • {listing.category}
                          </span>
                        </div>
                      </div>

                      <Badge
                        variant={
                          listing.status === "ACTIVE"
                            ? "live"
                            : listing.status === "PAUSED"
                            ? "amber"
                            : "red"
                        }
                        size="sm"
                      >
                        {listing.status}
                      </Badge>
                    </div>

                    {/* Price and Normalized Metric */}
                    <div className="flex items-baseline justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 block">
                          Asking Price
                        </span>
                        <span className="text-base font-black text-krishi-800">
                          ₹{listing.pricePerUnit.toLocaleString("en-IN")}/{listing.unit}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-semibold text-slate-400 block">
                          Mandi Eqv.
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          ₹{listing.pricePerQuintal.toLocaleString("en-IN")}/Q
                        </span>
                      </div>
                    </div>

                    {/* Remaining Stock Meter */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Available Stock:</span>
                        <span className="font-extrabold text-slate-800">
                          {listing.availableStock} / {listing.totalStock} {listing.unit}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            stockPercent > 50
                              ? "bg-krishi-600"
                              : stockPercent > 20
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${stockPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="truncate">{listing.location}</span>
                    </div>
                  </div>

                  {/* Actions Strip */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-1.5 mt-3">
                    <button
                      onClick={() => handleTogglePause(listing)}
                      disabled={loadingActionId === listing.id}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                      title={listing.status === "ACTIVE" ? "Pause listing" : "Resume listing"}
                    >
                      {listing.status === "ACTIVE" ? (
                        <>
                          <PauseCircle className="h-3.5 w-3.5 text-amber-600" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-3.5 w-3.5 text-krishi-600" />
                          <span>Resume</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onEditListing(listing)}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => onViewDetails(listing)}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-krishi-50 hover:bg-krishi-100 text-krishi-800 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => handleDelete(listing)}
                      disabled={loadingActionId === listing.id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete listing"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Incoming Purchase Requests Queue (Orders to Review) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Incoming Purchase Requests & Orders
            </h3>
            <p className="text-xs text-slate-400">
              Review requests from buyers, accept to allocate stock, and coordinate direct delivery
            </p>
          </div>
          <Badge variant="blue" size="md">
            {orders.length} {orders.length === 1 ? "Order" : "Orders"}
          </Badge>
        </div>

        {orders.length === 0 ? (
          <Card className="p-6 text-center bg-white border-slate-200 text-xs text-slate-500">
            No incoming purchase requests yet. New buyer inquiries will appear here automatically.
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const whatsappChatUrl = `https://wa.me/${order.buyerWhatsapp}?text=${encodeURIComponent(
                `Hello ${order.buyerName}, this is ${order.sellerName} regarding your purchase request #${order.id} for ${order.quantityRequested} ${order.unit} of ${order.cropName}.`
              )}`;

              return (
                <Card
                  key={order.id}
                  className="p-4 sm:p-5 border-slate-200 bg-white hover:border-slate-300 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Buyer & Crop Info */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-semibold text-slate-400">
                          #{order.id}
                        </span>
                        <Badge
                          variant={
                            order.status === "ACCEPTED"
                              ? "green"
                              : order.status === "PENDING"
                              ? "amber"
                              : order.status === "COMPLETED"
                              ? "blue"
                              : "red"
                          }
                          size="sm"
                        >
                          {order.status}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {new Date(order.createdAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>

                      <h4 className="text-base font-extrabold text-slate-900">
                        {order.buyerName}
                      </h4>

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span>
                          Produce: <strong>{order.cropName}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Requested:{" "}
                          <strong className="text-krishi-800">
                            {order.quantityRequested} {order.unit}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Total:{" "}
                          <strong className="text-slate-900">
                            ₹{order.totalPrice.toLocaleString("en-IN")}
                          </strong>{" "}
                          (@ ₹{order.unitPrice}/{order.unit})
                        </span>
                      </div>

                      {order.deliveryPreference && (
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-0.5">
                          <span className="text-slate-400">Logistics:</span>
                          <span className="font-medium text-slate-700">
                            {order.deliveryPreference}
                          </span>
                          {order.buyerAddress && (
                            <span className="text-slate-400 truncate">
                              ({order.buyerAddress})
                            </span>
                          )}
                        </div>
                      )}

                      {order.notes && (
                        <div className="text-xs italic text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-xl">
                          &ldquo;{order.notes}&rdquo;
                        </div>
                      )}
                    </div>

                    {/* Status Actions & WhatsApp Coordination */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                      {/* WhatsApp Button */}
                      <a
                        href={whatsappChatUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Chat Buyer</span>
                      </a>

                      {/* State Transitions for Seller */}
                      {order.status === "PENDING" && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={loadingActionId === order.id}
                            onClick={() => handleOrderStatusUpdate(order.id, "ACCEPTED")}
                            leftIcon={<CheckCircle className="h-3.5 w-3.5" />}
                          >
                            Accept Order
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={loadingActionId === order.id}
                            onClick={() => handleOrderStatusUpdate(order.id, "REJECTED")}
                            leftIcon={<XCircle className="h-3.5 w-3.5 text-red-500" />}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {order.status === "ACCEPTED" && (
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={loadingActionId === order.id}
                          onClick={() => handleOrderStatusUpdate(order.id, "COMPLETED")}
                          leftIcon={<CheckCircle className="h-3.5 w-3.5" />}
                        >
                          Mark Delivered & Paid
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Status Audit History Timeline */}
                  {order.statusHistory && order.statusHistory.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-500">Timeline:</span>
                      {order.statusHistory.map((step, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1">
                          <span className="font-medium text-slate-700">{step.status}</span>
                          <span className="text-slate-400">
                            ({new Date(step.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                          </span>
                          {idx < order.statusHistory.length - 1 && (
                            <span className="text-slate-300">→</span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
