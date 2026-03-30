import admin from "firebase-admin";

function readServiceAccount() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase Admin environment variables.");
  }

  return { projectId, clientEmail, privateKey };
}

function initializeAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(readServiceAccount()),
    });
  }

  return admin.firestore();
}

async function migrateUserTasks(db, uid) {
  const legacyTasksSnapshot = await db.collection("tasks").where("userId", "==", uid).get();

  if (legacyTasksSnapshot.empty) {
    console.log(`No legacy tasks found for ${uid}.`);
    return;
  }

  const batch = db.batch();
  let migratedCount = 0;

  legacyTasksSnapshot.docs.forEach((legacyDoc) => {
    const data = legacyDoc.data();
    const targetRef = db.collection("users").doc(uid).collection("tasks").doc(legacyDoc.id);

    batch.set(targetRef, {
      title: data.title || "",
      course: data.course || "",
      description: data.description || "",
      dueDate: data.dueDate || "",
      priority: data.priority || "Medium",
      estimatedMinutes: data.estimatedMinutes || 60,
      proofLink: data.proofLink || "",
      completionNote: data.completionNote || "",
      imageProofUrl: data.imageProofUrl || "",
      completed: Boolean(data.completed),
      completedAt: data.completedAt || "",
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || data.createdAt || new Date().toISOString(),
    }, { merge: true });

    migratedCount += 1;
  });

  await batch.commit();
  console.log(`Migrated ${migratedCount} legacy task(s) into users/${uid}/tasks.`);
}

async function main() {
  const uid = process.argv[2];
  if (!uid) {
    throw new Error("Pass the target Firebase UID. Example: npm run migrate:legacy-tasks -- yourUid");
  }

  const db = initializeAdmin();
  await migrateUserTasks(db, uid);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
