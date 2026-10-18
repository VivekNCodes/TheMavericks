import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { prisma, isDbActive } from "@/lib/db";
import { ExpertService } from "@/features/expert-connect/services/expert-service";
import { ConsultationCase } from "@/features/expert-connect/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || undefined;
    const expertId = searchParams.get("expertId") || undefined;

    if (isDbActive()) {
      try {
        const dbRecords = await prisma.consultationCase.findMany({
          where: {
            ...(expertId ? { expertId } : {}),
            ...(userId && !userId.startsWith("google-") ? { userId } : {}),
          },
          include: { expert: true },
          orderBy: { createdAt: "desc" },
          take: 30,
        });

        if (dbRecords.length > 0) {
          const cases: ConsultationCase[] = dbRecords.map((r) => ({
            id: r.id,
            userId: r.userId || undefined,
            farmerName: r.farmerName,
            farmerPhone: r.farmerPhone || undefined,
            farmerLocation: r.farmerLocation,
            preferredLanguage: r.preferredLanguage,
            cropName: r.cropName,
            growthStage: r.growthStage || undefined,
            consultationReason: r.consultationReason,
            symptomsDescription: r.symptomsDescription,
            symptomDuration: r.symptomDuration || undefined,
            imageUrls: r.imageUrls,
            aiSnapshot: r.aiRecommendation
              ? {
                  source: (r.aiSource as any) || "assistant",
                  recommendation: r.aiRecommendation,
                  reasoning: r.aiReasoning || undefined,
                  confidence: r.aiConfidence || undefined,
                }
              : undefined,
            farmContext: (r.weatherSnapshot as any) || { location: r.farmerLocation },
            consentSettings: {
              shareLocation: true,
              shareWeather: true,
              shareSoilAndFarmSize: true,
              farmerApproved: true,
              approvedAt: r.farmerConsentAt?.toISOString(),
            },
            expertId: r.expertId,
            expertName: r.expert?.fullName,
            expert: r.expert
              ? {
                  id: r.expert.id,
                  fullName: r.expert.fullName,
                  designation: r.expert.designation,
                  institution: r.expert.institution,
                  specializations: r.expert.specializations,
                  languages: r.expert.languages,
                  state: r.expert.state,
                  district: r.expert.district,
                  experienceYears: r.expert.experienceYears,
                  avatarUrl: r.expert.avatarUrl || undefined,
                  isVerified: r.expert.isVerified,
                  rating: r.expert.rating,
                  totalCasesSolved: r.expert.totalCasesSolved,
                  availability: r.expert.availability,
                  bio: r.expert.bio || "",
                  isDemonstrationRecord: true,
                }
              : undefined,
            status: r.status as any,
            submittedAt: r.submittedAt.toISOString(),
            acceptedAt: r.acceptedAt?.toISOString(),
            respondedAt: r.respondedAt?.toISOString(),
            resolvedAt: r.resolvedAt?.toISOString(),
            expertResponse: r.expertAdvice
              ? {
                  expertId: r.expertId,
                  expertName: r.expert?.fullName || "Assigned Specialist",
                  expertDesignation: r.expert?.designation || "Agricultural Specialist",
                  expertInstitution: r.expert?.institution || "ICAR Research Institute",
                  stance: (r.expertStance as any) || "MODIFIES",
                  advice: r.expertAdvice,
                  actionSteps: r.actionSteps || [],
                  precautions: r.precautions || [],
                  followUpNote: r.followUpNote || undefined,
                  respondedAt: (r.respondedAt || r.updatedAt).toISOString(),
                }
              : undefined,
            feedback: r.feedbackRating
              ? {
                  rating: r.feedbackRating,
                  helpful: r.feedbackHelpful ?? true,
                  comment: r.feedbackComment || undefined,
                  submittedAt: r.updatedAt.toISOString(),
                }
              : undefined,
          }));

          return successResponse({
            source: "neon-postgres",
            cases,
          });
        }
      } catch (dbErr) {
        console.warn("Neon DB fetch failed for consultation cases, using memory store:", dbErr);
      }
    }

    const cases = ExpertService.getAllCases(userId, expertId);
    return successResponse({
      source: "memory-store",
      cases,
    });
  } catch (err) {
    return errorResponse("Failed to fetch consultation cases", "INTERNAL_ERROR", 500, err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      farmerName,
      farmerPhone,
      farmerLocation,
      preferredLanguage,
      cropName,
      growthStage,
      consultationReason,
      symptomsDescription,
      symptomDuration,
      imageUrls,
      aiSnapshot,
      farmContext,
      consentSettings,
      expertId,
    } = body;

    if (!cropName || !consultationReason || !symptomsDescription || !expertId) {
      return errorResponse(
        "Missing required fields (cropName, consultationReason, symptomsDescription, expertId)",
        "BAD_REQUEST",
        400
      );
    }

    // Create via service first to guarantee valid object and ID
    const newCase = ExpertService.createCase({
      userId,
      farmerName,
      farmerPhone,
      farmerLocation,
      preferredLanguage,
      cropName,
      growthStage,
      consultationReason,
      symptomsDescription,
      symptomDuration,
      imageUrls: imageUrls || [],
      aiSnapshot,
      farmContext,
      consentSettings: consentSettings || {
        shareLocation: true,
        shareWeather: true,
        shareSoilAndFarmSize: true,
        farmerApproved: true,
        approvedAt: new Date().toISOString(),
      },
      expertId,
    });

    if (isDbActive()) {
      try {
        await prisma.consultationCase.create({
          data: {
            id: newCase.id,
            userId: userId && !userId.startsWith("google-") ? userId : null,
            farmerName: newCase.farmerName,
            farmerPhone: newCase.farmerPhone,
            farmerLocation: newCase.farmerLocation,
            preferredLanguage: newCase.preferredLanguage,
            cropName: newCase.cropName,
            growthStage: newCase.growthStage,
            consultationReason: newCase.consultationReason,
            symptomsDescription: newCase.symptomsDescription,
            symptomDuration: newCase.symptomDuration,
            imageUrls: newCase.imageUrls,
            aiSource: newCase.aiSnapshot?.source,
            aiRecommendation: newCase.aiSnapshot?.recommendation,
            aiReasoning: newCase.aiSnapshot?.reasoning,
            aiConfidence: newCase.aiSnapshot?.confidence,
            weatherSnapshot: newCase.farmContext as any,
            soilType: newCase.farmContext.soilType,
            irrigationStatus: newCase.farmContext.irrigationStatus,
            approvedReport: newCase as any,
            farmerConsentAt: new Date(),
            expertId: newCase.expertId,
            status: "PENDING",
            submittedAt: new Date(newCase.submittedAt),
          },
        });
      } catch (dbErr) {
        console.warn("Neon DB case creation fallback to local memory store:", dbErr);
      }
    }

    return successResponse(
      {
        case: newCase,
        message: "Consultation case created successfully.",
        deliveryChannel: "in-app-prototype-bus",
      },
      201
    );
  } catch (err) {
    return errorResponse("Failed to create consultation case", "INTERNAL_ERROR", 500, err);
  }
}
