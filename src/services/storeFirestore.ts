import { Firestore } from "@google-cloud/firestore";

interface PredictionData {
  result: string;
  suggestion: string;
  createdAt: string;
  fileUrl: string;
}

export async function storeFirestore(
  id: string,
  data: PredictionData
): Promise<void> {
  const db = new Firestore();
  const predictCollection = db.collection("predictions");
  await predictCollection.doc(id).set(data);
}
