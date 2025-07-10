const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

function getFileInfo(file) {
  const stats = fs.statSync(file.path);
  return {
    name: file.filename, // nombre temporal
    originalName: file.originalname, // nombre original
    path: file.path,
    size: stats.size,
  };
}

function cleanFolder(folderPath) {
  fs.readdirSync(folderPath).forEach((file) => {
    fs.unlinkSync(path.join(folderPath, file));
  });
}

// ✅ Ruta GET por defecto
app.get("/", (req, res) => {
  res.send("Servidor funcionando. Usa POST /compare para comparar imágenes.");
});

app.post(
  "/compare",
  upload.fields([{ name: "folder1" }, { name: "folder2" }]),
  (req, res) => {
    const folder1 = req.files.folder1 || [];
    const folder2 = req.files.folder2 || [];

    // Devuelve hash y nombre original
    const folder1Data = folder1.map((file) => {
      return { hash: getFileHash(file.path), ...getFileInfo(file) };
    });

    const folder2Data = folder2.map((file) => {
      return { hash: getFileHash(file.path), ...getFileInfo(file) };
    });

    const duplicates = [];
    folder1Data.forEach((f1) => {
      folder2Data.forEach((f2) => {
        if (f1.hash === f2.hash) {
          duplicates.push({ img1: f1, img2: f2 });
        }
      });
    });

    // Clean up
    cleanFolder("uploads");

    res.json(duplicates);
  }
);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
