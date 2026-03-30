import { HttpError, requireUser, sendError, sendJson } from "../_lib/auth.js";
import { verifyTaskProofImageMatch, verifyTaskProofMatch } from "../_lib/openai.js";

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  try {
    const { profile } = await requireUser(req);
    const { taskTitle, course, description, proofLink } = req.body || {};

    if (!proofLink?.trim()) {
      throw new HttpError(400, "A Google Docs proof link is required.");
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
