import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { DEFAULT_PLAN, DEFAULT_SETTINGS, DEFAULT_USAGE } from "../lib/constants";

function usersCollection() {
  return collection(db, "users");
}

function userRef(uid) {
  return doc(usersCollection(), uid);
}

function tasksCollection(uid) {
  return collection(db, "users", uid, "tasks");
}

function mergeDefaults(user, profile = {}) {
  return {
    uid: user.uid,
    email: user.email ?? profile.email ?? "",
    displayName: profile.displayName ?? user.displayName ?? "",
    createdAt: profile.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    onboarding: {
      completed: profile.onboarding?.completed ?? false,
      focusArea: profile.onboarding?.focusArea ?? "general",
    },
    plan: {
      ...DEFAULT_PLAN,
      ...profile.plan,
    },
    usage: {
      ...DEFAULT_USAGE,
      ...profile.usage,
    },
    stats: {
      currentStreak: profile.stats?.currentStreak ?? 0,
      longestStreak: profile.stats?.longestStreak ?? 0,
      tasksCompleted: profile.stats?.tasksCompleted ?? 0,
      focusHoursThisWeek: profile.stats?.focusHoursThisWeek ?? 0,
      perfectQuizRuns: profile.stats?.perfectQuizRuns ?? 0,
    },
    settings: {
      ...DEFAULT_SETTINGS,
      ...profile.settings,
    },
    studyProfile: {
      schoolName: profile.studyProfile?.schoolName ?? "",
      courseLoad: profile.studyProfile?.courseLoad ?? "",
      goal: profile.studyProfile?.goal ?? "Build consistency",
    },
  };
}

export async function ensureUserProfile(user) {
  const ref = userRef(user.uid);
  const snapshot = await getDoc(ref);
  const profile = mergeDefaults(user, snapshot.exists() ? snapshot.data() : {});
  await setDoc(
    ref,
    {
      ...profile,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
  return profile;
}

export async function getUserProfile(user) {
  const snapshot = await getDoc(userRef(user.uid));
  return mergeDefaults(user, snapshot.exists() ? snapshot.data() : {});
}

export async function updateUserProfile(uid, patch) {
  await setDoc(
    userRef(uid),
    {
      ...patch,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function listTasks(uid) {
  const snapshot = await getDocs(tasksCollection(uid));
  return snapshot.docs.map((entry) => ({
    id: entry.id,
    ...entry.data(),
  }));
}

export async function createTask(uid, payload) {
  await addDoc(tasksCollection(uid), {
    ...payload,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: "",
  });
}

export async function updateTask(uid, taskId, payload) {
  await updateDoc(doc(db, "users", uid, "tasks", taskId), {
    ...payload,
    updatedAt: new Date().toISOString(),
  });
}

export async function removeTask(uid, taskId) {
  await deleteDoc(doc(db, "users", uid, "tasks", taskId));
}
