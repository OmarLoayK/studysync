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
  try {
    await uploadBytes(objectRef, file);
    return { url: await getDownloadURL(objectRef), path: objectRef.fullPath };
  } catch (error) {
    throw new Error(friendlyStorageError(error));
  }
}

// Firebase's raw messages (bucket names, pricing links) aren't meant for students.
function friendlyStorageError(error) {
  switch (error?.code) {
    case "storage/quota-exceeded":
      return "Image uploads are temporarily unavailable. Please try again later.";
    case "storage/unauthorized":
      return "Your account isn't allowed to upload this file. Make sure it's an image under 5 MB.";
    case "storage/retry-limit-exceeded":
    case "storage/canceled":
      return "The upload didn't finish. Check your connection and try again.";
    default:
      return "Could not upload the image. Please try again.";
  }
}
