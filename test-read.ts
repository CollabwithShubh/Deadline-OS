import { getDb } from './src/backend/database/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

async function main() {
  const q = query(collection(getDb(), 'tasks'), where('userId', '==', 'test-uid'));
  const snap = await getDocs(q);
  console.log(`Found ${snap.docs.length} tasks`);
  process.exit(0);
}
main().catch(console.error);
