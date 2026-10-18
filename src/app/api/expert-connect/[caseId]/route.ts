import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { prisma, isDbActive } from "@/lib/db";
import { ExpertService } from "@/features/expert-connect/services/expert-service";

interface RouteParams {
  params: {
    caseId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { caseId } = params;
    if (!caseId) {
      return errorResponse("Missing caseId parameter", "BAD_REQUEST", 400);
    }

    const c = ExpertService.getCaseById(caseId);
    if (!c) {
      return errorResponse("Consultation case not found", "NOT_FOUND", 404);
    }

    return successResponse({ case: c });
  } catch (err) {
    return errorResponse("Failed to fetch case", "INTERNAL_ERROR", 500, err);
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { caseId } = params;
    const body = await request.json();
    const { action, status, response, feedback } = body;

    if (!caseId) {
      return errorResponse("Missing caseId parameter", "BAD_REQUEST", 400);
    }

    const existingCase = ExpertService.getCaseById(caseId);
    if (!existingCase) {
      return errorResponse("Consultation case not found", "NOT_FOUND", 404);
    }

    let updated = existingCase;

    // 1. Expert submits advice
    if (action === "submit_response" && response) {
      const res = ExpertService.submitExpertResponse(caseId, response);
      if (res) updated = res;

      if (isDbActive()) {
        try {
          await prisma.consultationCase.update({
            where: { id: caseId },
            data: {
              status: "RESPONDED",
              expertStance: response.stance,
              expertAdvice: response.advice,
              actionSteps: response.actionSteps,
              precautions: response.precautions,
              followUpNote: response.followUpNote,
              respondedAt: new Date(),
            },
          });
        } catch (dbErr) {
          console.warn("DB update failed on expert response, updated memory store:", dbErr);
        }
      }
    }
    // 2. Farmer submits feedback rating
    else if (action === "submit_feedback" && feedback) {
      const res = ExpertService.submitFarmerFeedback(caseId, feedback);
      if (res) updated = res;

      if (isDbActive()) {
        try {
          await prisma.consultationCase.update({
            where: { id: caseId },
            data: {
              status: "RESOLVED",
              feedbackRating: feedback.rating,
              feedbackHelpful: feedback.helpful,
              feedbackComment: feedback.comment,
              resolvedAt: new Date(),
            },
          });
        } catch (dbErr) {
          console.warn("DB update failed on farmer feedback:", dbErr);
        }
      }
    }
    // 3. Status transition (e.g. ACCEPTED, IN_PROGRESS, DECLINED)
    else if (status) {
      const res = ExpertService.updateCaseStatus(caseId, status);
      if (res) updated = res;

      if (isDbActive()) {
        try {
          await prisma.consultationCase.update({
            where: { id: caseId },
            data: {
              status,
              ...(status === "ACCEPTED" ? { acceptedAt: new Date() } : {}),
              ...(status === "RESOLVED" ? { resolvedAt: new Date() } : {}),
            },
          });
        } catch (dbErr) {
          console.warn("DB status transition failed, updated memory store:", dbErr);
        }
      }
    }

    return successResponse({
      case: updated,
      message: `Case ${caseId} updated successfully.`,
    });
  } catch (err) {
    return errorResponse("Failed to update consultation case", "INTERNAL_ERROR", 500, err);
  }
}
