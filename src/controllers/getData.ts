import { Request, Response } from "express";
import { Firestore } from "@google-cloud/firestore";

const db = new Firestore();

export const getData = async (req: Request, res: Response): Promise<void> => {
  try {
    const collectionName = "predictions";
    const snapshot = await db.collection(collectionName).get();

    if (snapshot.empty) {
      res.status(404).json({
        status: "error",
        message: "Tidak ada data.",
      });
      return;
    }

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      history: {
        ...doc.data(),
        id: doc.id,
      },    
    }));

    res.status(200).json({
      status: "success",
      data: data,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: "Error mengambil data",
      error: error.message,
    });
  }
};
