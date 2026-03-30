import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase/config";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function uploadTaskProofImage(uid, file) {
  if (!file) {
    throw new Error("No image selected.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Proof uploads must be image files.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Proof images must be 5 MB or smaller.");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const objectRef = ref(storage, `users/${uid}/proof-images/${Date.now()}-${safeName}`);
  await uploadBytes(objectRef, file);
  return getDownloadURL(objectRef);
}
