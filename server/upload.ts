import express from "express";
import multer from "multer";
import { storagePut } from "./storage";

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 16 * 1024 * 1024 } // 16MB limit
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    const fileKey = `audio/${timestamp}-${randomSuffix}.webm`;

    const result = await storagePut(fileKey, req.file.buffer, "audio/webm");

    res.json({ url: result.url, key: result.key });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;

