import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { MarketplaceStore } from "@/features/marketplace/server/marketplace-store";
import { MarketplaceFilter, ProduceUnit } from "@/features/marketplace/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filter: MarketplaceFilter = {
      searchQuery: searchParams.get("q") || searchParams.get("search") || "",
      category: searchParams.get("category") || undefined,
      cropType: searchParams.get("crop") || searchParams.get("cropType") || undefined,
      state: searchParams.get("state") || undefined,
      district: searchParams.get("district") || undefined,
      grade: searchParams.get("grade") || undefined,
      sortBy: searchParams.get("sortBy") || "latest",
    };

    const minPrice = searchParams.get("minPrice");
    if (minPrice) filter.minPrice = parseFloat(minPrice);

    const maxPrice = searchParams.get("maxPrice");
    if (maxPrice) filter.maxPrice = parseFloat(maxPrice);

    const minQuantity = searchParams.get("minQuantity");
    if (minQuantity) filter.minQuantity = parseFloat(minQuantity);

    const userId = searchParams.get("userId") || undefined;

    const listings = await MarketplaceStore.getListings(filter, userId);

    return successResponse({
      count: listings.length,
      listings,
    });
  } catch (err) {
    console.error("GET /api/marketplace/listings error:", err);
    return errorResponse("Failed to fetch marketplace listings", "INTERNAL_ERROR", 500, err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Server-side Validation
    const {
      userId,
      title,
      cropName,
      category = "Vegetables",
      variety,
      description,
      unit = "quintal",
      pricePerUnit,
      totalStock,
      grade = "A Grade (Premium)",
      state = "Rajasthan",
      district = "Jaipur",
      village,
      pickupDelivery = "Farmgate Pickup & Seller Delivery Available",
      sellerName = "Ramesh Kumar",
      sellerPhone = "+91 98765 43210",
      sellerWhatsapp,
      sellerEmail,
      images = [],
    } = body;

    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return errorResponse("Product title must be at least 3 characters", "BAD_REQUEST", 400);
    }

    if (!cropName || typeof cropName !== "string") {
      return errorResponse("Crop name is required", "BAD_REQUEST", 400);
    }

    if (!pricePerUnit || typeof pricePerUnit !== "number" || pricePerUnit <= 0) {
      return errorResponse("A valid price per unit greater than 0 is required", "BAD_REQUEST", 400);
    }

    if (!totalStock || typeof totalStock !== "number" || totalStock <= 0) {
      return errorResponse("Available stock must be a number greater than 0", "BAD_REQUEST", 400);
    }

    if (!sellerWhatsapp || typeof sellerWhatsapp !== "string" || sellerWhatsapp.trim().length < 8) {
      return errorResponse("Seller WhatsApp number is required for direct buyer coordination", "BAD_REQUEST", 400);
    }

    const cleanWhatsapp = sellerWhatsapp.replace(/\D/g, "");
    if (cleanWhatsapp.length < 10) {
      return errorResponse("Please provide a valid WhatsApp number (minimum 10 digits)", "BAD_REQUEST", 400);
    }

    // Default image if none provided
    const validImages = Array.isArray(images) && images.length > 0 ? images : ["/icons/crop-tomato.svg"];

    const locationStr = [village, district, state].filter(Boolean).join(", ");

    const created = await MarketplaceStore.createListing({
      userId: userId || "google-10982348234",
      title: title.trim(),
      cropName: cropName.trim(),
      category: category.trim(),
      variety: variety?.trim() || undefined,
      description: description?.trim() || undefined,
      unit: unit as ProduceUnit,
      pricePerUnit: Number(pricePerUnit),
      totalStock: Number(totalStock),
      grade: grade.trim(),
      state: state.trim(),
      district: district.trim(),
      village: village?.trim() || undefined,
      location: locationStr,
      pickupDelivery: pickupDelivery.trim(),
      sellerName: sellerName.trim(),
      sellerPhone: sellerPhone.trim(),
      sellerWhatsapp: cleanWhatsapp,
      sellerEmail: sellerEmail?.trim() || undefined,
      harvestDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      status: "ACTIVE",
      images: validImages,
    });

    return successResponse({
      message: "Listing published successfully",
      listing: created,
    }, 201);
  } catch (err) {
    console.error("POST /api/marketplace/listings error:", err);
    return errorResponse("Failed to create listing", "INTERNAL_ERROR", 500, err);
  }
}
