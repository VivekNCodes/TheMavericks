import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { prisma, isDbActive } from "@/lib/db";
import { ChatSessionRecord } from "@/features/chatbot/types";

// In-memory mock store for sessions when Neon DB is offline
const memorySessions: ChatSessionRecord[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session, userId, farmerName = "Guest Farmer" } = body;

    if (!session || !session.id || !Array.isArray(session.messages)) {
      return errorResponse("Invalid chat session payload", "BAD_REQUEST", 400);
    }

    if (isDbActive()) {
      try {
        const saved = await prisma.chatSession.upsert({
          where: { id: session.id },
          create: {
            id: session.id,
            userId: userId && !userId.startsWith("google-") ? userId : null,
            farmerName,
            title: session.title || "Farming Discussion",
            language: session.language || "en",
            messages: session.messages,
          },
          update: {
            title: session.title || "Farming Discussion",
            language: session.language || "en",
            messages: session.messages,
            updatedAt: new Date(),
          },
        });

        return successResponse({
          source: "neon-postgres",
          id: saved.id,
          savedAt: saved.updatedAt,
        });
      } catch (dbErr) {
        console.warn("Neon session save failed, using local store:", dbErr);
      }
    }

    // Local fallback
    const localRecord: ChatSessionRecord = {
      id: session.id,
      userId,
      farmerName,
      title: session.title || "Farming Discussion",
      language: session.language || "en",
      createdAt: session.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: session.messages,
    };

    const existingIdx = memorySessions.findIndex((s) => s.id === session.id);
    if (existingIdx >= 0) {
      memorySessions[existingIdx] = localRecord;
    } else {
      memorySessions.unshift(localRecord);
    }

    return successResponse({
      source: "local-storage-fallback",
      id: localRecord.id,
      savedAt: localRecord.updatedAt,
    });
  } catch (err) {
    return errorResponse("Failed to persist chat session", "INTERNAL_ERROR", 500, err);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (isDbActive()) {
    try {
      const records = await prisma.chatSession.findMany({
        where: userId && !userId.startsWith("google-") ? { userId } : {},
        orderBy: { updatedAt: "desc" },
        take: 20,
      });

      return successResponse({
        source: "neon-postgres",
        sessions: records.map((r) => ({
          id: r.id,
          userId: r.userId || undefined,
          farmerName: r.farmerName,
          title: r.title,
          language: r.language as any,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
          messages: r.messages as any,
        })),
      });
    } catch (dbErr) {
      console.warn("Neon sessions fetch failed, using fallback:", dbErr);
    }
  }

  return successResponse({
    source: "local-storage-fallback",
    sessions: memorySessions,
  });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("id");

  if (!sessionId) {
    return errorResponse("Missing session id", "BAD_REQUEST", 400);
  }

  if (isDbActive()) {
    try {
      await prisma.chatSession.delete({ where: { id: sessionId } });
      return successResponse({ id: sessionId, deleted: true });
    } catch (e) {
      console.warn("DB session delete failed:", e);
    }
  }

  const idx = memorySessions.findIndex((s) => s.id === sessionId);
  if (idx >= 0) memorySessions.splice(idx, 1);

  return successResponse({ id: sessionId, deleted: true });
}
