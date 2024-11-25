import Router from "express";
import { getData } from "@/controllers/getData";
import { helloWorld } from "@/controllers/helloWorld";
import { postPredict } from "@/controllers/predict";
import { upload } from "@/middlewares/multer";

export const router = Router();

router.get("/predict/histories", getData);
router.get("/", helloWorld);
router.post("/predict", upload.single("image"), postPredict);
