import { HttpError, requireUser, sendError, sendJson } from "../_lib/auth.js";
import { getAdminBucket, getAdminDb } from "../_lib/firebaseAdmin.js";
import { verifyTaskProofImageMatch, verifyTaskProofMatch } from "../_lib/openai.js";
import { admin } from "../_lib/firebaseAdmin.js";

const PROOF_HOURLY_LIMIT = 10;

// Uploaded proof is passed as a Storage path (never a URL) so it can only be the
// caller's own file; the server reads it and sends it to the model as a data URL.
async function loadUploadedProofImage(uid, storagePath) {
  if (!storagePath.startsWith(`users/${uid}/proof-images/`) || storagePath.includes("..")) {
    throw new HttpError(400, "Invalid proof image.");
  }
  const file = getAdminBucket().file(storagePath);
  const [exists] = await file.exists();
  if (!exists) {
    throw new HttpError(400, "Proof image not found. Try uploading it again.");
  }
  const [[metadata], [buffer]] = await Promise.all([file.getMetadata(), file.download()]);
  if (!`${metadata.contentType}`.startsWith("image/")) {
    throw new HttpError(400, "Proof uploads must be image files.");
  }
  return { file, dataUrl: `data:${metadata.contentType};base64,${buffer.toString("base64")}` };
}

function extractGoogleDocId(url) {
  const match = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
  return match?.[1] || "";
}

async function fetchGoogleDocText(url) {
  const docId = extractGoogleDocId(url);
  if (!docId) {
    throw new HttpError(400, "Use a valid Google Docs link.");
  }

  const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
  const response = await fetch(exportUrl, {
    headers: {
      "User-Agent": "StudySync Proof Verifier",
    },
  });

  if (!response.ok) {
    throw new HttpError(400, "StudySync could not read that Google Doc. Make sure it is shared so anyone with the link can view it.");
  }

  const text = (await response.text()).trim();
  if (!text) {
    throw new HttpError(400, "That Google Doc did not return any readable text.");
  }

  return text.slice(0, 12000);
}

async function fetchGoogleDocHtml(url) {
  const docId = extractGoogleDocId(url);
  if (!docId) {
    throw new HttpError(400, "Use a valid Google Docs link.");
  }

  const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=html`;
  const response = await fetch(exportUrl, {
    headers: {
      "User-Agent": "StudySync Proof Verifier",
    },
  });

  if (!response.ok) {
    return "";
  }

  return response.text();
}

function extractImageUrlsFromHtml(html) {
  if (!html) return [];

  const matches = [...html.matchAll(/<img[^>]+src="([^"]+)"/gi)];
  return matches
    .map((match) => match[1]?.replace(/&amp;/g, "&"))
    .filter((value) => value?.startsWith("http"));
}

async function checkAndIncrementProofRateLimit(userRef) {
  const db = getAdminDb();
  const hourKey = new Date().toISOString().slice(0, 13);

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(userRef);
    const data = snapshot.data() || {};
    const proofUsage = data.proofUsage || {};

    const used = proofUsage.hourKey === hourKey ? proofUsage.verificationsInHour || 0 : 0;

    if (used >= PROOF_HOURLY_LIMIT) {
      throw new HttpError(429, `Proof verification limit reached (${PROOF_HOURLY_LIMIT} per hour). Try again shortly.`);
    }

    transaction.set(
      userRef,
      {
        proofUsage: {
          hourKey,
          verificationsInHour: used + 1,
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  try {
    const { profile, userRef, decoded } = await requireUser(req);
    const { taskTitle, course, description, completionNote, proofLink, imageStoragePath } = req.body || {};
    const taskContext = {
      taskTitle: `${taskTitle ?? ""}`.trim().slice(0, 300),
      course: `${course ?? ""}`.trim().slice(0, 200),
      description: `${description ?? ""}`.trim().slice(0, 2000),
      completionNote: `${completionNote ?? ""}`.trim().slice(0, 1000),
    };

    if (!proofLink?.trim() && !imageStoragePath?.trim()) {
      throw new HttpError(400, "A Google Docs proof link or proof image is required.");
    }

    await checkAndIncrementProofRateLimit(userRef);

    if (imageStoragePath?.trim()) {
      const { file, dataUrl } = await loadUploadedProofImage(decoded.uid, imageStoragePath.trim());
      const verification = await verifyTaskProofImageMatch({ ...taskContext, imageUrl: dataUrl }, { tier: profile.plan?.tier });
      if (!verification?.matches) {
        // Don't keep rejected uploads around.
        await file.delete({ ignoreNotFound: true });
      }
      return sendJson(res, 200, { verification });
    }

    const trimmedLink = proofLink.trim();
    const html = await fetchGoogleDocHtml(trimmedLink);
    const imageUrls = extractImageUrlsFromHtml(html);

    let verification;

    if (imageUrls.length > 0) {
      verification = await verifyTaskProofImageMatch(
        {
          taskTitle: `${taskTitle ?? ""}`.trim(),
          course: `${course ?? ""}`.trim(),
          description: `${description ?? ""}`.trim(),
          imageUrl: imageUrls[0],
        },
        { tier: profile.plan?.tier },
      );
    } else {
      const documentText = await fetchGoogleDocText(trimmedLink);
      verification = await verifyTaskProofMatch(
        {
          taskTitle: `${taskTitle ?? ""}`.trim(),
          course: `${course ?? ""}`.trim(),
          description: `${description ?? ""}`.trim(),
          documentText,
        },
        { tier: profile.plan?.tier },
      );
    }

    return sendJson(res, 200, { verification });
  } catch (error) {
    return sendError(res, error);
  }
}
