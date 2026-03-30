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
  const status = error.status || 500;
  const message = error.message || "Unexpected server error.";
  return sendJson(res, status, { error: message });
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
