import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import fs from 'fs';

// Verify config exists
if (!fs.existsSync('./firebase-applet-config.json')) {
  console.error('Error: firebase-applet-config.json not found.');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId);

const args = process.argv.slice(2);
const isDryRun = !args.includes('--confirm-reset');
const confirmedProject = args.find((a) => a.startsWith('--confirm-project='))?.split('=')[1];

async function resetDatabase() {
  console.log(`=======================================================`);
  console.log(`INSTITUTIONAL DATABASE ADMINISTRATIVE PURGE UTILITY`);
  console.log(`Target Project: ${config.projectId}`);
  console.log(`Target Database: ${config.firestoreDatabaseId || '(default)'}`);
  console.log(`Execution Mode: ${isDryRun ? 'DRY-RUN (Simulated - no changes will be made)' : 'DESTRUCTIVE PURGE'}`);
  console.log(`=======================================================`);

  if (!isDryRun) {
    if (confirmedProject !== config.projectId) {
      console.error(
        `\n[SAFETY ABORT] Destructive purge requires confirmation matching target project ID.\nRun with: --confirm-reset --confirm-project=${config.projectId}\n`
      );
      process.exit(1);
    }
  }

  // Load administrative credentials strictly from environment
  const adminEmail = process.env.ADMIN_RESET_EMAIL;
  const adminPass = process.env.ADMIN_RESET_PASSWORD;

  if (!adminEmail || !adminPass) {
    console.error(
      `\n[AUTH ERROR] Missing credentials. Set ADMIN_RESET_EMAIL and ADMIN_RESET_PASSWORD in environment before running.`
    );
    process.exit(1);
  }

  try {
    await signInWithEmailAndPassword(auth, adminEmail, adminPass);
    console.log(`Authenticated successfully as administrative user: ${adminEmail}`);
  } catch (err: any) {
    console.error(`[AUTH FAILURE] Unable to authenticate administrative user:`, err.message);
    process.exit(1);
  }

  const collectionsToClear = [
    'users',
    'studentProfiles',
    'teacherProfiles',
    'assessmentAttempts',
    'proctoringEvents',
    'notifications',
    'learningPlans',
    'students',
  ];

  let totalDocsFound = 0;
  let totalDocsPurged = 0;

  for (const colName of collectionsToClear) {
    try {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      totalDocsFound += snapshot.size;
      console.log(`\nCollection "${colName}": ${snapshot.size} document(s) detected.`);

      for (const docSnap of snapshot.docs) {
        if (isDryRun) {
          console.log(`  [DRY-RUN] Would delete ${colName}/${docSnap.id}`);
        } else {
          await deleteDoc(doc(db, colName, docSnap.id));
          totalDocsPurged++;
          console.log(`  ✓ Deleted ${colName}/${docSnap.id}`);
        }
      }
    } catch (err: any) {
      console.warn(`Notice on collection "${colName}":`, err.message);
    }
  }

  console.log(`\n=======================================================`);
  if (isDryRun) {
    console.log(`DRY-RUN COMPLETE: ${totalDocsFound} document(s) evaluated across ${collectionsToClear.length} collections.`);
    console.log(`To execute destructive reset, re-run with:`);
    console.log(`ADMIN_RESET_EMAIL=... ADMIN_RESET_PASSWORD=... tsx scripts/reset-database.ts --confirm-reset --confirm-project=${config.projectId}`);
  } else {
    console.log(`PURGE COMPLETE: ${totalDocsPurged} document(s) permanently removed.`);
  }
  console.log(`=======================================================`);
  process.exit(0);
}

resetDatabase().catch((err) => {
  console.error('Fatal execution error during reset:', err);
  process.exit(1);
});
