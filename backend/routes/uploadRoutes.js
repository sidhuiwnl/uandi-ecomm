const express = require("express");
const multer = require("multer");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const r2 = require("../config/r2");
const sharp = require("sharp");
const crypto = require("crypto");
const fs = require("fs");
const util = require("util");
const { exec } = require("child_process");
const path = require("path");

const execPromise = util.promisify(exec);
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// helper: upload buffer to R2
async function uploadToR2(buffer, key, mimeType) {
  const uploadParams = {
    Bucket: process.env.CF_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  };

  await r2.send(new PutObjectCommand(uploadParams));
  return `https://pub-25688779f5b34d7a87524a48c1772ab6.r2.dev/${key}`;
}

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const id = crypto.randomUUID();
    const mimeType = file.mimetype;
    let fileUrl = "";

    if (mimeType.startsWith("image/")) {
      // compress image (keep resolution)
      const compressedBuffer = await sharp(file.buffer)
        .webp({ quality: 80 })
        .toBuffer();

      const key = `${id}.webp`;
      fileUrl = await uploadToR2(compressedBuffer, key, "image/webp");

    } else if (mimeType.startsWith("video/")) {
      // compress video using ffmpeg
      const ext = mimeType.split("/")[1];
      const tempInput = `temp-${id}-input.${ext}`;
      const tempOutput = `temp-${id}-output.mp4`;

      fs.writeFileSync(tempInput, file.buffer);

      await execPromise(
        `ffmpeg -i ${tempInput} -vcodec libx264 -crf 28 -preset fast -movflags +faststart ${tempOutput}`
      );

      const compressedBuffer = fs.readFileSync(tempOutput);
      const key = `${id}.mp4`;
      fileUrl = await uploadToR2(compressedBuffer, key, "video/mp4");

      fs.unlinkSync(tempInput);
      fs.unlinkSync(tempOutput);
    } else {
      return res.status(400).json({ message: "Unsupported file type" });
    }

    res.json({ success: true, url: fileUrl });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, message: "Upload failed", error: err.message });
  }
});

module.exports = router;
