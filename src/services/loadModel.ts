import * as tf from "@tensorflow/tfjs-node";
import path from "path";

async function loadModel(): Promise<tf.GraphModel> {
  const modelUrl: string = process.env.MODEL_URL || "";
  if (!modelUrl) {
    throw new Error("MODEL_URL environment variable is not defined");
  }

  return tf.loadGraphModel(`file://${path.resolve(modelUrl)}`);
  // return tf.loadGraphModel(modelUrl);
}

export class LoadModel {
  private model: any;

  constructor() {
    this.model = null;
  }

  async loadModel() {
    if (!this.model) {
      this.model = await loadModel();
    }
    return this.model;
  }
}
