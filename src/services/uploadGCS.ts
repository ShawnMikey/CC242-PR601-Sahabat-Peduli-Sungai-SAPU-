import { Storage, Bucket } from "@google-cloud/storage";
import dotenv from "dotenv";

dotenv.config();

export const initializeBucket = (): { bucket: Bucket; bucketName: string } => {
  const bucketName: string = process.env.BUCKET_NAME || "";

  if (!bucketName) {
    throw new Error("BUCKET_NAME is not defined in environment variables.");
  }

  const storage = new Storage({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });

  const bucket = storage.bucket(bucketName);

  return { bucket, bucketName };
};

const { bucket, bucketName } = initializeBucket();

export const uploadGCS = async (file: Express.Multer.File): Promise<string> => {
  const blob = bucket.file(Date.now() + "-" + file.originalname);

  const blobStream = blob.createWriteStream({
    resumable: false,
    contentType: file.mimetype,
    metadata: { contentType: file.mimetype },
  });

  return new Promise((resolve, reject) => {
    blobStream
      .on("finish", () => {
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
        resolve(publicUrl);
      })
      .on("error", (err) => {
        reject(err);
      })
      .end(file.buffer);
  });
};
