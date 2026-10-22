import { getAdminAuth, getAdminDb } from "./firebaseAdmin.js";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function sendJson(res, status, payload) {
  res.status(status).json(payload);
}

export function sendError(res, error) {
  // Messages we wrote for users (HttpError) are safe to show.
  if (error instanceof HttpError) {
    return sendJson(res, error.status, { error: error.message });
  }

  // Expired or invalid Firebase ID tokens.
  if (`${error?.code || ""}`.startsWith("auth/")) {
    return sendJson(res, 401, { error: "Your session expired. Please log in again." });
  }

  // Anything else (OpenAI, Stripe, config) stays in the server logs, not the browser.
  console.error("Unhandled API error", error);
  return sendJson(res, 500, { error: "Something went wrong on our side. Please try again in a moment." });
}

export async function requireUser(req) {
  const authorization = req.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing Firebase auth token.");
  }

  const token = authorization.slice("Bearer ".length);
  const decoded = await getAdminAuth().verifyIdToken(token);
  const db = getAdminDb();
  const userRef = db.collection("users").doc(decoded.uid);
  const userSnapshot = await userRef.get();

  if (!userSnapshot.exists) {
    throw new HttpError(404, "User profile not found. Log in again to initialize StudySync.");
  }

  return {
    db,
    userRef,
    decoded,
    profile: userSnapshot.data(),
  };
}
