import * as tf from "@tensorflow/tfjs-node";
import { InputError } from "@exceptions/InputError";

export async function predictClassification(
  model: tf.GraphModel,
  image: Buffer
) {
  try {
    const tensor = tf.node
      .decodeJpeg(image)
      .resizeNearestNeighbor([224, 224])
      .expandDims()
      .toFloat();

    const prediction = model.predict(tensor) as tf.Tensor;
    const score = await prediction.data();
    const confidenceScore = Math.max(...score) * 100;

    const classResult = prediction.dataSync()[0];
    const label = classResult === 1 ? "Cancer" : "Non-cancer";

    const suggestion =
      {
        Cancer: "Segera periksa ke dokter!",
        "Non-cancer": "Penyakit kanker tidak terdeteksi.",
      }[label] || "";

    // console.log("Prediction:", prediction);
    // console.log("Class Result (index):", classResult);
    // console.log("Predicted Label:", label);

    return { confidenceScore, label, suggestion };
  } catch (error: any) {
    throw new InputError(`Terjadi kesalahan input: ${error.message}`);
  }
}
