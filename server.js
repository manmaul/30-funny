// server.js - Replit / Railway friendly microservice
import express from "express";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";
impimport express from "express";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import crypto from "crypto";

const execFileP = promisify(execFile);
const app = express();
app.use(express.json({ limit: "50mb" }));

const TMP_ROOT = "./tmp";
if (!fs.existsSync(TMP_ROOT)) fs.mkdirSync(TMP_ROOT);

/* --------------------------------------
   Helper: crear carpeta temporal única
-------------------------------------- */
function createTempFolder() {
  const id = Date.now() + "_" + crypto.randomBytes(4).toString("hex");
  const folder = path.join(TMP_ROOT, id);
  fs.mkdirSync(folder, { recursive: true });
  return folder;
}

/* --------------------------------------
   POST /download
-------------------------------------- */
app.post("/download", async (req, res) => {
  const { url } = req.body;
  if (!url || !/^https?:\/\//.test(url)) {
    return res.status(400).json({ ok: false, error: "URL inválida" });
  }

  const tmpFolder = createTempFolder();
  const outTemplate = path.join(tmpFolder, "video.%(ext)s");

  try {
    console.log(`⬇️ Descargando: ${url} en ${tmpFolder}`);

    // yt-dlp: best video/audio, retry 2
    await execFileP("yt-dlp", [
      "-f", "bestvideo[ext=mp4]+bestaudio/best",
      "-o", outTemplate,
      url
    ], { timeout: 180_000 });

    const files = fs.readdirSync(tmpFolder).filter(f => f.startsWith("video."));
    if (!files.length) throw new Error("No se generó archivo");

    const filepath = path.join(tmpFolder, files[0]);
    const stat = fs.statSync(filepath);

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Length", stat.size);

    const stream = fs.createReadStream(filepath);
    stream.pipe(res);

    stream.on("close", () => {
      console.log("✅ Envío completado:", filepath);
      // limpiar carpeta temporal
      fs.rmSync(tmpFolder, { recursive: true, force: true });
    });

    stream.on("error", (err) => {
      console.error("❌ Error stream:", err);
      fs.rmSync(tmpFolder, { recursive: true, force: true });
    });

  } catch (err) {
    console.error("❌ Error descarga:", err);
    // limpiar carpeta temporal aunque falle
    fs.rmSync(tmpFolder, { recursive: true, force: true });
    res.status(500).json({ ok: false, error: String(err) });
  }
});

/* --------------------------------------
   Root
-------------------------------------- */
app.get("/", (req, res) => res.send("yt-dlp microservice OK"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
