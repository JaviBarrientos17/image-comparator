require("dotenv").config(); // ← carga variables de .env

const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();

// ⚙️ Variables de entorno
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
const LOG_LEVEL = process.env.LOG_LEVEL || "info";

// Middleware
app.use(cors());
app.use(express.json());

// Multer config
const upload = multer({ dest: UPLOAD_DIR });

// Funciones utilitarias
function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

function getFileInfo(filePath) {
  const stats = fs.statSync(filePath);
  return {
    name: path.basename(filePath),
    path: filePath,
    size: stats.size,
  };
}

function cleanFolder(folderPath) {
  fs.readdirSync(folderPath).forEach((file) => {
    fs.unlinkSync(path.join(folderPath, file));
  });
}

// GET / (verificación)
app.get("/", (req, res) => {
  res.send("Servidor de comparación de imágenes funcionando.");
});

// POST /compare
app.post(
  "/compare",
  upload.fields([{ name: "folder1" }, { name: "folder2" }]),
  (req, res) => {
    try {
      const folder1 = req.files.folder1 || [];
      const folder2 = req.files.folder2 || [];

      if (LOG_LEVEL === "debug") {
        console.log(`📥 Received ${folder1.length} images in folder1`);
        console.log(`📥 Received ${folder2.length} images in folder2`);
      }

      const folder1Data = folder1.map((file) => ({
        hash: getFileHash(file.path),
        ...getFileInfo(file.path),
        originalName: file.originalname,
      }));

      const folder2Data = folder2.map((file) => ({
        hash: getFileHash(file.path),
        ...getFileInfo(file.path),
        originalName: file.originalname,
      }));

      const duplicates = [];

      folder1Data.forEach((f1) => {
        folder2Data.forEach((f2) => {
          if (f1.hash === f2.hash) {
            duplicates.push({ img1: f1, img2: f2 });
          }
        });
      });

      if (LOG_LEVEL === "debug") {
        console.log(`🔍 Found duplicates: ${duplicates.length}`);
      }

      cleanFolder(UPLOAD_DIR);

      res.json(duplicates);
    } catch (error) {
      console.error("❌ Error during comparison:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server listening at https://image-comparator.onrender.com/`);
});
