import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { InputError } from "@/exceptions/InputError";
import { router } from "@/routes/router";
import { LoadModel } from "@/services/loadModel";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(router);

app.use((err: any, req: any, res: any, next: any) => {
  if (err instanceof InputError) {
    return res.status(err.statusCode).json({
      status: "fail",
      // message: `${err.message} : Silakan gunakan foto lain.`
      message: "Terjadi kesalahan dalam melakukan prediksi"
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      status: "fail",
      // message: `${err.message} : Ukuran file tidak boleh lebih dari 1 MB.`
      message: "Payload content length greater than maximum allowed: 1000000",
    });
  }

  return res.status(500).json({
    status: "error",
    // message: "Internal Server Error",
    message: `${err.message}`,
  });
});

app.listen(port, async () => {
  try {
    const loadModel = new LoadModel();
    await loadModel.loadModel();
    console.log(`Server listening on Port ${port}`);
  } catch (error) {
    console.error("Error starting server", error);
  }
});
