import { HttpError, requireUser, sendError, sendJson } from "../_lib/auth.js";
import { admin } from "../_lib/firebaseAdmin.js";
import { generateStudyArtifact } from "../_lib/openai.js";

function monthKey() {
  return new Date().toISOString().slice(0, 7);
}

function getCollectionName(tool) {
  if (tool === "planner") return "studyPlans";
  if (tool === "quiz") return "quizzes";
  if (tool === "flashcards") return "flashcards";
  return "notes";
}

async function reserveAiUsage(userRef, profile) {
  if (profile.plan?.tier !== "premium" || !["active", "trialing"].includes(profile.plan?.status)) {
    throw new HttpError(403, "Premium is required to use AI tools.");
  }

  const db = userRef.firestore;
  const limit = Number(process.env.PREMIUM_AI_MONTHLY_LIMIT || 60);
  const currentMonth = monthKey();

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(userRef);
    const latestProfile = snapshot.data() || {};
    const usage = latestProfile.usage || {};
    const used = usage.aiMonthKey === currentMonth ? usage.aiGenerationsUsed || 0 : 0;

    if (used >= limit) {
      throw new HttpError(402, "You have used all premium AI credits for this month.");
    }

    transaction.set(
      userRef,
      {
        usage: {
          ...usage,
          aiMonthKey: currentMonth,
          aiGenerationsUsed: used + 1,
          aiGenerationsLimit: limit,
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return {
      used: used + 1,
      limit,
    };
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  try {
    const { tool, payload } = req.body || {};
    if (!tool || !payload || typeof payload !== "object") {
      throw new HttpError(400, "Missing AI tool payload.");
    }

    const { db, decoded, userRef, profile } = await requireUser(req);
    const usage = await reserveAiUsage(userRef, profile);
    const result = await generateStudyArtifact(tool, {
      ...payload,
      studentContext: {
        email: decoded.email,
        preferredStudyWindow: profile.settings?.preferredStudyWindow,
        availableStudyHours: profile.settings?.availableStudyHours,
        weeklyGoalHours: profile.settings?.weeklyGoalHours,
      },
    });

    const sharedPayload = {
      tool,
      result,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      monthKey: monthKey(),
    };

    await db.collection("users").doc(decoded.uid).collection("aiGenerations").add(sharedPayload);
    await db.collection("users").doc(decoded.uid).collection(getCollectionName(tool)).add(sharedPayload);

    return sendJson(res, 200, {
      result,
      usage,
    });
  } catch (error) {
    return sendError(res, error);
  }
}
