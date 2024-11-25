import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { predictClassification } from "@services/inferenceService";
import { LoadModel } from "@services/loadModel";
import { storeFirestore } from "@/services/storeFirestore";
import { uploadGCS } from "@/services/uploadGCS";

export async function postPredict(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  // Pastikan lat dan lon ada di body request
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: "Coordinates (latitude and longitude) are required" });
  }

  const loadModel = new LoadModel();
  const model = await loadModel.loadModel();

  if (!model) {
    return res.status(500).json({ error: "Model not loaded yet" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "No image provided" });
  }

  try {
    const image = req.file.buffer;

    // const gcsUrl = await uploadGCS(req.file);

    const { confidenceScore, label, suggestion } = await predictClassification(
      model,
      image
    );

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const data = {
      id,
      result: label,
      suggestion,
      createdAt,
      fileUrl: "http://test.com",
      coordinates: {
        latitude,
        longitude,
      },
    };

    const message = "Model is predicted successfully";

    // await storeFirestore(id, data);

    return res.status(201).json({
      status: "success",
      message,
      data,
    });
  } catch (error: any) {
    next(error);
  }
}
