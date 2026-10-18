import { prisma, isDbActive } from "./db";
import type { FarmerUser, FarmerCropRecord, UserAgriculturalContext } from "@/types/auth";
import fs from "fs";
import path from "path";

// Local persistent file fallback for offline/preview environments
interface FallbackStore {
  users: Record<string, FarmerUser>;
  crops: Record<string, FarmerCropRecord[]>;
  diseaseLogs: Record<string, Array<{
    id: string;
    userId: string;
    detectedDisease: string;
    scientificName?: string | null;
    confidence: number;
    severity: string;
    symptoms?: string | null;
    treatmentSummary?: string | null;
    imageUrl: string;
    createdAt: string;
  }>>;
}

const fallbackFilePath = path.join(process.cwd(), ".data", "local-agrosaathi-store.json");

function loadFallbackStore(): FallbackStore {
  try {
    if (fs.existsSync(fallbackFilePath)) {
      const data = fs.readFileSync(fallbackFilePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn("Failed to read local data store, initializing fresh store:", err);
  }
  return {
    users: {
      "preset-ramesh": {
        id: "preset-ramesh",
        googleId: "google-preset-ramesh-101",
        name: "Ramesh Kumar",
        email: "ramesh.kumar.farmer@gmail.com",
        role: "FARMER",
        location: "Jaipur, Rajasthan",
        state: "Rajasthan",
        district: "Jaipur",
        avatarUrl: "/images/ramesh-avatar.webp",
        isVerified: true,
        acres: 3.7,
        farmSize: 3.7,
        farmSizeUnit: "acre",
        preferredLanguage: "hi",
        soilType: "Sandy Loam",
        irrigationMethod: "Drip & Tube-well",
        farmingExperience: 14,
        createdAt: new Date("2024-01-15").toISOString(),
      },
    },
    crops: {
      "preset-ramesh": [
        {
          id: "crop-preset-1",
          userId: "preset-ramesh",
          cropName: "Tomato",
          variety: "Abhinav F1",
          acreage: 1.2,
          growthStage: "FLOWERING",
          sowingDate: new Date(Date.now() - 40 * 86400000).toISOString(),
          expectedHarvestDate: new Date(Date.now() + 35 * 86400000).toISOString(),
          fieldLocation: "Jaipur North - Block A",
          soilType: "Sandy Loam",
          irrigationType: "Drip Irrigation",
          imageUrl: "/images/crop-tomato.webp",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "crop-preset-2",
          userId: "preset-ramesh",
          cropName: "Wheat",
          variety: "HD-2967",
          acreage: 2.5,
          growthStage: "GRAIN_FILLING",
          sowingDate: new Date(Date.now() - 85 * 86400000).toISOString(),
          expectedHarvestDate: new Date(Date.now() + 25 * 86400000).toISOString(),
          fieldLocation: "Jaipur North - Plot 2",
          soilType: "Sandy Loam",
          irrigationType: "Sprinkler",
          imageUrl: "/images/crop-wheat.webp",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
    diseaseLogs: {
      "preset-ramesh": [
        {
          id: "disease-preset-1",
          userId: "preset-ramesh",
          detectedDisease: "Tomato - Early Blight",
          scientificName: "Alternaria solani",
          confidence: 0.94,
          severity: "MODERATE",
          symptoms: "Concentric brown rings on lower leaves",
          treatmentSummary: "Apply Mancozeb 75 WP (2g/L) and remove diseased lower foliage",
          imageUrl: "/images/crop-tomato.webp",
          createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        },
      ],
    },
  };
}

function saveFallbackStore(store: FallbackStore): void {
  try {
    const dir = path.dirname(fallbackFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fallbackFilePath, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to persist local store file:", err);
  }
}

// -------------------------------------------------------------
// USER IDENTITY & PROFILE OPERATIONS
// -------------------------------------------------------------

export async function upsertGoogleUser(data: {
  email: string;
  name: string;
  googleId?: string;
  avatarUrl?: string;
}): Promise<FarmerUser> {
  const { email, name, googleId, avatarUrl } = data;

  if (isDbActive()) {
    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            ...(googleId ? [{ googleId }] : []),
          ],
        },
      });

      if (existingUser) {
        const updated = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            fullName: name || existingUser.fullName,
            googleId: googleId || existingUser.googleId,
            avatarUrl: avatarUrl || existingUser.avatarUrl,
            lastLoginAt: new Date(),
          },
        });

        return {
          id: updated.id,
          googleId: updated.googleId || undefined,
          name: updated.fullName,
          email: updated.email || email,
          role: updated.role,
          location: `${updated.district}, ${updated.state}`,
          state: updated.state,
          district: updated.district,
          village: updated.village || undefined,
          avatarUrl: updated.avatarUrl || avatarUrl || "/images/ramesh-avatar.webp",
          isVerified: updated.isVerified,
          acres: updated.farmSize || 3.0,
          farmSize: updated.farmSize || 3.0,
          farmSizeUnit: updated.farmSizeUnit || "acre",
          preferredName: updated.preferredName || undefined,
          preferredLanguage: (updated.preferredLanguage as any) || "en",
          soilType: updated.soilType || undefined,
          irrigationMethod: updated.irrigationMethod || undefined,
          farmingExperience: updated.farmingExperience || undefined,
          createdAt: updated.createdAt.toISOString(),
          lastLoginAt: updated.lastLoginAt?.toISOString(),
        };
      }

      // Create new user in Neon Postgres
      const created = await prisma.user.create({
        data: {
          email,
          fullName: name || "Farmer",
          googleId,
          avatarUrl: avatarUrl || "/images/ramesh-avatar.webp",
          state: "Rajasthan",
          district: "Jaipur",
          isVerified: true,
          farmSize: 3.0,
          farmSizeUnit: "acre",
          lastLoginAt: new Date(),
        },
      });

      return {
        id: created.id,
        googleId: created.googleId || undefined,
        name: created.fullName,
        email: created.email || email,
        role: created.role,
        location: `${created.district}, ${created.state}`,
        state: created.state,
        district: created.district,
        village: created.village || undefined,
        avatarUrl: created.avatarUrl || avatarUrl || "/images/ramesh-avatar.webp",
        isVerified: created.isVerified,
        acres: created.farmSize || 3.0,
        farmSize: created.farmSize || 3.0,
        farmSizeUnit: created.farmSizeUnit || "acre",
        preferredLanguage: "en",
        createdAt: created.createdAt.toISOString(),
        lastLoginAt: created.lastLoginAt?.toISOString(),
      };
    } catch (err) {
      console.warn("Neon Postgres user upsert failed, falling back to local store:", err);
    }
  }

  // Local fallback storage
  const store = loadFallbackStore();
  let userKey = Object.keys(store.users).find(
    (k) => store.users[k].email.toLowerCase() === email.toLowerCase() || (googleId && store.users[k].googleId === googleId)
  );

  if (!userKey) {
    userKey = `user-${Date.now()}`;
    const newUser: FarmerUser = {
      id: userKey,
      googleId: googleId || `g-${Date.now()}`,
      name: name || "Farmer",
      email,
      role: "FARMER",
      location: "Jaipur, Rajasthan",
      state: "Rajasthan",
      district: "Jaipur",
      avatarUrl: avatarUrl || "/images/ramesh-avatar.webp",
      isVerified: true,
      acres: 3.0,
      farmSize: 3.0,
      farmSizeUnit: "acre",
      preferredLanguage: "en",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    store.users[userKey] = newUser;
    saveFallbackStore(store);
    return newUser;
  }

  const existing = store.users[userKey];
  existing.name = name || existing.name;
  existing.googleId = googleId || existing.googleId;
  existing.avatarUrl = avatarUrl || existing.avatarUrl;
  existing.lastLoginAt = new Date().toISOString();
  saveFallbackStore(store);
  return existing;
}

export async function getUserById(userId: string): Promise<FarmerUser | null> {
  if (isDbActive()) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (user) {
        return {
          id: user.id,
          googleId: user.googleId || undefined,
          name: user.fullName,
          email: user.email || "",
          role: user.role,
          location: `${user.district}, ${user.state}`,
          state: user.state,
          district: user.district,
          village: user.village || undefined,
          avatarUrl: user.avatarUrl || "/images/ramesh-avatar.webp",
          isVerified: user.isVerified,
          acres: user.farmSize || 3.0,
          farmSize: user.farmSize || 3.0,
          farmSizeUnit: user.farmSizeUnit || "acre",
          preferredName: user.preferredName || undefined,
          preferredLanguage: (user.preferredLanguage as any) || "en",
          soilType: user.soilType || undefined,
          irrigationMethod: user.irrigationMethod || undefined,
          farmingExperience: user.farmingExperience || undefined,
          createdAt: user.createdAt.toISOString(),
          lastLoginAt: user.lastLoginAt?.toISOString(),
        };
      }
    } catch (err) {
      console.warn("DB getUserById failed, checking local store:", err);
    }
  }

  const store = loadFallbackStore();
  return store.users[userId] || null;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<FarmerUser>
): Promise<FarmerUser | null> {
  if (isDbActive()) {
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          fullName: updates.name,
          preferredName: updates.preferredName,
          preferredLanguage: updates.preferredLanguage,
          state: updates.state,
          district: updates.district,
          village: updates.village,
          farmSize: updates.farmSize !== undefined ? updates.farmSize : updates.acres,
          farmSizeUnit: updates.farmSizeUnit,
          soilType: updates.soilType,
          irrigationMethod: updates.irrigationMethod,
          farmingExperience: updates.farmingExperience,
          avatarUrl: updates.avatarUrl,
        },
      });

      return {
        id: updated.id,
        googleId: updated.googleId || undefined,
        name: updated.fullName,
        email: updated.email || "",
        role: updated.role,
        location: `${updated.district}, ${updated.state}`,
        state: updated.state,
        district: updated.district,
        village: updated.village || undefined,
        avatarUrl: updated.avatarUrl || "/images/ramesh-avatar.webp",
        isVerified: updated.isVerified,
        acres: updated.farmSize || 3.0,
        farmSize: updated.farmSize || 3.0,
        farmSizeUnit: updated.farmSizeUnit || "acre",
        preferredName: updated.preferredName || undefined,
        preferredLanguage: (updated.preferredLanguage as any) || "en",
        soilType: updated.soilType || undefined,
        irrigationMethod: updated.irrigationMethod || undefined,
        farmingExperience: updated.farmingExperience || undefined,
        createdAt: updated.createdAt.toISOString(),
        lastLoginAt: updated.lastLoginAt?.toISOString(),
      };
    } catch (err) {
      console.warn("DB updateUserProfile error, updating local store:", err);
    }
  }

  const store = loadFallbackStore();
  const existing = store.users[userId];
  if (!existing) return null;

  const merged: FarmerUser = {
    ...existing,
    ...updates,
    location: updates.district && updates.state ? `${updates.district}, ${updates.state}` : existing.location,
    acres: updates.farmSize !== undefined ? updates.farmSize : updates.acres ?? existing.acres,
  };
  store.users[userId] = merged;
  saveFallbackStore(store);
  return merged;
}

export async function deleteUserAccount(userId: string): Promise<boolean> {
  if (isDbActive()) {
    try {
      await prisma.user.delete({
        where: { id: userId },
      });
      return true;
    } catch (err) {
      console.warn("DB deleteUserAccount failed:", err);
    }
  }

  const store = loadFallbackStore();
  delete store.users[userId];
  delete store.crops[userId];
  delete store.diseaseLogs[userId];
  saveFallbackStore(store);
  return true;
}

// -------------------------------------------------------------
// USER CROPS PERSISTENCE (STRICT USER OWNERSHIP)
// -------------------------------------------------------------

export async function getUserCrops(userId: string): Promise<FarmerCropRecord[]> {
  if (isDbActive()) {
    try {
      const records = await prisma.cropProfile.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      return records.map((r) => ({
        id: r.id,
        userId: r.userId,
        cropName: r.cropName,
        variety: r.variety,
        acreage: r.acreage,
        growthStage: r.growthStage,
        sowingDate: r.sowingDate ? r.sowingDate.toISOString() : null,
        expectedHarvestDate: r.expectedHarvestDate ? r.expectedHarvestDate.toISOString() : null,
        fieldLocation: r.fieldLocation,
        soilType: r.soilType,
        irrigationType: r.irrigationType,
        fertilizerNotes: r.fertilizerNotes,
        notes: r.notes,
        imageUrl: r.imageUrl,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    } catch (err) {
      console.warn("DB getUserCrops failed, checking local store:", err);
    }
  }

  const store = loadFallbackStore();
  return store.crops[userId] || [];
}

export async function createCrop(
  userId: string,
  data: {
    cropName: string;
    variety?: string;
    acreage: number;
    growthStage?: string;
    sowingDate?: string;
    expectedHarvestDate?: string;
    fieldLocation?: string;
    soilType?: string;
    irrigationType?: string;
    fertilizerNotes?: string;
    notes?: string;
    imageUrl?: string;
  }
): Promise<FarmerCropRecord> {
  const stage = (data.growthStage as any) || "VEGETATIVE";

  if (isDbActive()) {
    try {
      const created = await prisma.cropProfile.create({
        data: {
          userId,
          cropName: data.cropName,
          variety: data.variety || null,
          acreage: data.acreage,
          growthStage: stage,
          sowingDate: data.sowingDate ? new Date(data.sowingDate) : null,
          expectedHarvestDate: data.expectedHarvestDate ? new Date(data.expectedHarvestDate) : null,
          fieldLocation: data.fieldLocation || null,
          soilType: data.soilType || null,
          irrigationType: data.irrigationType || null,
          fertilizerNotes: data.fertilizerNotes || null,
          notes: data.notes || null,
          imageUrl: data.imageUrl || "/images/crop-wheat.webp",
        },
      });

      return {
        id: created.id,
        userId: created.userId,
        cropName: created.cropName,
        variety: created.variety,
        acreage: created.acreage,
        growthStage: created.growthStage,
        sowingDate: created.sowingDate?.toISOString() || null,
        expectedHarvestDate: created.expectedHarvestDate?.toISOString() || null,
        fieldLocation: created.fieldLocation,
        soilType: created.soilType,
        irrigationType: created.irrigationType,
        fertilizerNotes: created.fertilizerNotes,
        notes: created.notes,
        imageUrl: created.imageUrl,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn("DB createCrop error, saving to local store:", err);
    }
  }

  const store = loadFallbackStore();
  if (!store.crops[userId]) {
    store.crops[userId] = [];
  }

  const newCrop: FarmerCropRecord = {
    id: `crop-${Date.now()}`,
    userId,
    cropName: data.cropName,
    variety: data.variety || null,
    acreage: data.acreage,
    growthStage: data.growthStage || "VEGETATIVE",
    sowingDate: data.sowingDate || new Date().toISOString(),
    expectedHarvestDate: data.expectedHarvestDate || null,
    fieldLocation: data.fieldLocation || "Main Farm",
    soilType: data.soilType || null,
    irrigationType: data.irrigationType || null,
    fertilizerNotes: data.fertilizerNotes || null,
    notes: data.notes || null,
    imageUrl: data.imageUrl || "/images/crop-wheat.webp",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.crops[userId].unshift(newCrop);
  saveFallbackStore(store);
  return newCrop;
}

export async function updateCrop(
  userId: string,
  cropId: string,
  updates: Partial<FarmerCropRecord>
): Promise<FarmerCropRecord | null> {
  if (isDbActive()) {
    try {
      // Enforce user ownership in where query
      const existing = await prisma.cropProfile.findFirst({
        where: { id: cropId, userId },
      });
      if (!existing) return null;

      const updated = await prisma.cropProfile.update({
        where: { id: cropId },
        data: {
          cropName: updates.cropName,
          variety: updates.variety,
          acreage: updates.acreage,
          growthStage: updates.growthStage as any,
          sowingDate: updates.sowingDate ? new Date(updates.sowingDate) : undefined,
          expectedHarvestDate: updates.expectedHarvestDate ? new Date(updates.expectedHarvestDate) : undefined,
          fieldLocation: updates.fieldLocation,
          soilType: updates.soilType,
          irrigationType: updates.irrigationType,
          fertilizerNotes: updates.fertilizerNotes,
          notes: updates.notes,
          imageUrl: updates.imageUrl,
        },
      });

      return {
        id: updated.id,
        userId: updated.userId,
        cropName: updated.cropName,
        variety: updated.variety,
        acreage: updated.acreage,
        growthStage: updated.growthStage,
        sowingDate: updated.sowingDate?.toISOString() || null,
        expectedHarvestDate: updated.expectedHarvestDate?.toISOString() || null,
        fieldLocation: updated.fieldLocation,
        soilType: updated.soilType,
        irrigationType: updated.irrigationType,
        fertilizerNotes: updated.fertilizerNotes,
        notes: updated.notes,
        imageUrl: updated.imageUrl,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      console.warn("DB updateCrop failed:", err);
    }
  }

  const store = loadFallbackStore();
  const userCrops = store.crops[userId] || [];
  const idx = userCrops.findIndex((c) => c.id === cropId);
  if (idx === -1) return null;

  const merged: FarmerCropRecord = {
    ...userCrops[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  userCrops[idx] = merged;
  store.crops[userId] = userCrops;
  saveFallbackStore(store);
  return merged;
}

export async function deleteCrop(userId: string, cropId: string): Promise<boolean> {
  if (isDbActive()) {
    try {
      const existing = await prisma.cropProfile.findFirst({
        where: { id: cropId, userId },
      });
      if (!existing) return false;

      await prisma.cropProfile.delete({
        where: { id: cropId },
      });
      return true;
    } catch (err) {
      console.warn("DB deleteCrop failed:", err);
    }
  }

  const store = loadFallbackStore();
  const userCrops = store.crops[userId] || [];
  const idx = userCrops.findIndex((c) => c.id === cropId);
  if (idx === -1) return false;

  userCrops.splice(idx, 1);
  store.crops[userId] = userCrops;
  saveFallbackStore(store);
  return true;
}

// -------------------------------------------------------------
// USER DISEASE DIAGNOSIS HISTORY
// -------------------------------------------------------------

export async function getUserDiseaseLogs(userId: string) {
  if (isDbActive()) {
    try {
      const records = await prisma.diseaseLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
      return records.map((r) => ({
        id: r.id,
        userId: r.userId || userId,
        detectedDisease: r.detectedDisease,
        scientificName: r.scientificName,
        confidence: r.confidence,
        severity: r.severity,
        symptoms: r.symptoms,
        treatmentSummary: r.treatmentSummary,
        imageUrl: r.imageUrl,
        createdAt: r.createdAt.toISOString(),
      }));
    } catch (err) {
      console.warn("DB getUserDiseaseLogs failed:", err);
    }
  }

  const store = loadFallbackStore();
  return store.diseaseLogs[userId] || [];
}

export async function recordUserDiseaseLog(
  userId: string,
  log: {
    detectedDisease: string;
    scientificName?: string;
    confidence: number;
    severity?: string;
    symptoms?: string;
    treatmentSummary?: string;
    imageUrl?: string;
  }
) {
  if (isDbActive()) {
    try {
      const created = await prisma.diseaseLog.create({
        data: {
          userId,
          detectedDisease: log.detectedDisease,
          scientificName: log.scientificName || null,
          confidence: log.confidence,
          severity: (log.severity as any) || "MODERATE",
          symptoms: log.symptoms || null,
          treatmentSummary: log.treatmentSummary || null,
          imageUrl: log.imageUrl || "/images/crop-tomato.webp",
        },
      });
      return created;
    } catch (err) {
      console.warn("DB recordUserDiseaseLog failed:", err);
    }
  }

  const store = loadFallbackStore();
  if (!store.diseaseLogs[userId]) {
    store.diseaseLogs[userId] = [];
  }
  const newLog = {
    id: `diag-${Date.now()}`,
    userId,
    detectedDisease: log.detectedDisease,
    scientificName: log.scientificName || null,
    confidence: log.confidence,
    severity: log.severity || "MODERATE",
    symptoms: log.symptoms || null,
    treatmentSummary: log.treatmentSummary || null,
    imageUrl: log.imageUrl || "/images/crop-tomato.webp",
    createdAt: new Date().toISOString(),
  };
  store.diseaseLogs[userId].unshift(newLog);
  saveFallbackStore(store);
  return newLog;
}

// -------------------------------------------------------------
// USER AGRICULTURAL CONTEXT FOR GEMINI CHATBOT
// -------------------------------------------------------------

export async function getUserAgriculturalContext(userId: string): Promise<UserAgriculturalContext | null> {
  const user = await getUserById(userId);
  if (!user) return null;

  const crops = await getUserCrops(userId);
  const diseases = await getUserDiseaseLogs(userId);

  return {
    farmerName: user.preferredName || user.name,
    email: user.email,
    location: user.location,
    preferredLanguage: user.preferredLanguage || "en",
    farmSize: user.farmSize || user.acres,
    farmSizeUnit: user.farmSizeUnit || "acre",
    soilType: user.soilType,
    irrigationMethod: user.irrigationMethod,
    farmingExperience: user.farmingExperience,
    crops: crops.map((c) => ({
      cropName: c.cropName,
      variety: c.variety,
      acreage: c.acreage,
      growthStage: c.growthStage,
      sowingDate: c.sowingDate,
      expectedHarvestDate: c.expectedHarvestDate,
      fieldLocation: c.fieldLocation,
      soilType: c.soilType,
      irrigationType: c.irrigationType,
    })),
    recentDiseases: diseases.slice(0, 3).map((d) => ({
      detectedDisease: d.detectedDisease,
      scientificName: d.scientificName,
      severity: d.severity,
      createdAt: d.createdAt,
    })),
  };
}
