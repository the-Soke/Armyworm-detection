// === IMPORTS ===
import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import sharp from "sharp";
import * as ort from "onnxruntime-node";
import { fileURLToPath } from "url";
import fs from "fs";

// === SETUP PATH HELPERS ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === APP CONFIG ===
const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend from public/
app.use(express.static(path.join(__dirname, "public")));
// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// === MULTER CONFIG ===
const upload = multer({ dest: "uploads/" });

// === MODEL LOADING ===
const modelPath = path.resolve(__dirname, "model", "model.onnx");
if (!fs.existsSync(modelPath)) {
  console.error("❌ Model file not found at", modelPath);
  process.exit(1);
}

console.log("🧠 Loading model from:", modelPath);
let session;
try {
  session = await ort.InferenceSession.create(modelPath);
  console.log("✅ Model loaded successfully!");
} catch (err) {
  console.error("❌ Failed to load ONNX model:", err.message);
  process.exit(1);
}

// === IMAGE DIMENSIONS ===
const WIDTH = 224;
const HEIGHT = 224;

// === ROUTE: PREDICT ===
app.post("/predict", upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;
    console.log("📸 Received image:", imagePath);

    // Preprocess image
    const imageBuffer = await sharp(imagePath)
      .resize(WIDTH, HEIGHT, { fit: "fill" })
      .removeAlpha()
      .raw()
      .toBuffer();

    const floatArray = Float32Array.from(imageBuffer).map(v => v / 255.0);

    // HWC -> CHW
    const [C, H, W] = [3, HEIGHT, WIDTH];
    const transposed = new Float32Array(floatArray.length);
    for (let i = 0; i < H * W; i++) {
      transposed[i] = floatArray[i * 3];          // R
      transposed[i + H * W] = floatArray[i * 3 + 1]; // G
      transposed[i + 2 * H * W] = floatArray[i * 3 + 2]; // B
    }

    const inputTensor = new ort.Tensor("float32", transposed, [1, 3, H, W]);

    // Run model
    const feeds = { input: inputTensor };
    const results = await session.run(feeds);
    const output = results[Object.keys(results)[0]];

    // Calculate confidence %
    let prob = output.data[0];
    if (prob < 0 || prob > 1) {
      prob = 1 / (1 + Math.exp(-prob)); // sigmoid if logit
    }
    const confidencePercent = Math.round(prob * 100);
    const prediction = prob > 0.5 ? "armyworm" : "no-armyworm";

    res.json({
      prediction,
      confidence: confidencePercent,
      message:
        prediction === "armyworm"
          ? "UH UH! looks like those nasty worms might be around 🐛"
          : "All clear! No armyworms detected ✅",
      imageUrl: `/uploads/${req.file.filename}`,
    });
  } catch (error) {
    console.error("❌ Error during prediction:", error);
    res.status(500).json({ error: "Failed to process image." });
  }
});

// === START SERVER ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
