import { Firestore } from "@google-cloud/firestore";

interface PredictionData {
  result: string;
  suggestion: string;
  createdAt: string;
  fileUrl: string;
  coordinates?: { latitude: number; longitude: number };
}

export async function storeFirestore(
  id: string,
  data: PredictionData
): Promise<void> {
  try {
    const db = new Firestore();
    const predictCollection = db.collection("predictions");

    await predictCollection.doc(id).set(data);
  } catch (error) {
    console.error("Error storing data in Firestore:", error);
    throw new Error("Failed to store data in Firestore");
  }
}
