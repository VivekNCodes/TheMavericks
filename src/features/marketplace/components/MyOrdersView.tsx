"use client";

import React, { useState } from "react";
import {
  MessageCircle,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ShoppingBag,
  MapPin,
  Truck,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MarketplaceOrderItem } from "../types";
import { useAuth } from "@/context/AuthContext";

interface MyOrdersViewProps {
  orders: MarketplaceOrderItem[];
  onRefresh: () => void;
  onBrowseProduce: () => void;
}

export const MyOrdersView: React.FC<MyOrdersViewProps> = ({
  orders,
  onRefresh,
  onBrowseProduce,
}) => {
  const { user } = useAuth();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this purchase request?")) {
      return;
    }

    setCancellingId(orderId);
    setErrorMessage(null);

    const targetOrder = orders.find((o) => o.id === orderId);
    const effectiveUserId = user?.id || targetOrder?.buyerId || "buyer";

    try {
      const res = await fetch(`/api/marketplace/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: effectiveUserId,
          newStatus: "CANCELLED",
          actorRole: "buyer",
          note: "Buyer cancelled the purchase request.",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to cancel order");
      }

      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900">
            My Purchase Requests & Orders
          </h3>
          <p className="text-xs text-slate-400">
            Track status of your orders, direct farmer contact, and delivery progress
          </p>
        </div>
        <Badge variant="blue" size="md">
          {orders.length} {orders.length === 1 ? "Request" : "Requests"}
        </Badge>
      </div>

      {orders.length === 0 ? (
        <Card className="p-8 text-center bg-slate-50 border-dashed border-2 border-slate-200 space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-krishi-100 text-krishi-800">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-800">
              No Purchase Requests Placed Yet
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Browse freshly harvested produce from verified farmers and submit purchase requests directly with zero intermediary markups.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={onBrowseProduce}
            leftIcon={<ShoppingBag className="h-4 w-4" />}
          >
            Browse Marketplace Produce
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const whatsappChatUrl = `https://wa.me/${order.sellerWhatsapp}?text=${encodeURIComponent(
              `Hello ${order.sellerName}, I am following up on my purchase request #${order.id} for ${order.quantityRequested} ${order.unit} of ${order.cropName} on AgroSaathi.`
            )}`;

            return (
              <Card
                key={order.id}
                className="p-5 border-slate-200 bg-white hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Column: Details */}
                  <div className="space-y-2">
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
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          dateStyle: "medium",
                        })}
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900">
                      {order.listingTitle}
                    </h4>

                    {/* Breakdown */}
                    <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
                      <span>
                        Quantity:{" "}
                        <strong className="text-krishi-800">
                          {order.quantityRequested} {order.unit}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Unit Price: <strong>₹{order.unitPrice}/{order.unit}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Total:{" "}
                        <strong className="text-slate-900 text-sm font-black">
                          ₹{order.totalPrice.toLocaleString("en-IN")}
                        </strong>
                      </span>
                    </div>

                    {/* Logistics */}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Truck className="h-3.5 w-3.5 text-slate-400" />
                      <span>Preference: {order.deliveryPreference}</span>
                      {order.buyerAddress && (
                        <span>• Destination: {order.buyerAddress}</span>
                      )}
                    </div>

                    {/* Seller Contact Info */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs text-slate-700 max-w-lg mt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-semibold">Farmer / Seller:</span>
                        <span className="font-bold">{order.sellerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {order.sellerEmail && (
                          <a
                            href={`mailto:${order.sellerEmail}`}
                            className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
                            title={order.sellerEmail}
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <a
                          href={whatsappChatUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>WhatsApp Seller</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2 shrink-0">
                    <a
                      href={whatsappChatUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Chat Farmer</span>
                    </a>

                    {order.status === "PENDING" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={cancellingId === order.id}
                        onClick={() => handleCancelOrder(order.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        Cancel Request
                      </Button>
                    )}
                  </div>
                </div>

                {/* Status Timeline History */}
                {order.statusHistory && order.statusHistory.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
                    <div className="font-semibold text-slate-500">Audit Status History:</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {order.statusHistory.map((step, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1">
                          <span className="font-bold text-slate-700">{step.status}</span>
                          <span className="text-slate-400">
                            by {step.actor} ({new Date(step.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                          </span>
                          {idx < order.statusHistory.length - 1 && (
                            <span className="text-slate-300">→</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
