import { execFile } from "child_process";
import fs from "fs/promises";
import path from "path";

const TEMP_DIR = "./temp_videos";
const TIKTOK_TARGET = 25;
const YT_TARGET = 5;
const HASHTAGS = ["humor","funny","graciosos","divertidos","lol","memesvirales"];

/* ---------------------------------------------------
    UTILIDAD: ejecutar yt-dlp con retry y logs
--------------------------------------------------- */
function runYtDlp(url, outPath, retries = 2) {
  return new Promise((resolve, reject) => {
    const args = [
      "-o", outPath,
      "--no-warnings",
      "--no-call-home",
      "--match-filter", "duration < 60",
      url
    ];

    execFile("yt-dlp", args, { maxBuffer: 1024*1024*200 }, (err, stdout, stderr) => {
      if (!err) return resolve(stdout);

      if (retries > 0) {
        console.warn(`yt-dlp fallo, reintentando (${retries}) →`, url);
        return resolve(runYtDlp(url, outPath, retries - 1));
      }

      reject(stderr || err);
    });
  });
}

/* ---------------------------------------------------
    Crear carpeta temp si no existe
--------------------------------------------------- */
async function ensureTemp() {
  await fs.mkdir(TEMP_DIR, { recursive: true });
}

/* ---------------------------------------------------
    TikTok vía buscador interno de yt-dlp
--------------------------------------------------- */
async function gatherTikTokUrls() {
  const urls = [];

  for (const tag of HASHTAGS) {
    urls.push(`ttsearch${Math.ceil(TIKTOK_TARGET / HASHTAGS.length)}:${tag}`);
    if (urls.length >= TIKTOK_TARGET) break;
  }

  return urls.slice(0, TIKTOK_TARGET);
}

/* ---------------------------------------------------
    Shorts vía ytsearch + filtro por duración
--------------------------------------------------- */
async function gatherYouTubeShorts() {
  const urls = [];

  for (const tag of HASHTAGS) {
    urls.push(`ytsearch${Math.ceil(YT_TARGET / HASHTAGS.length)}:shorts ${tag}`);
    if (urls.length >= YT_TARGET) break;
  }

  return urls.slice(0, YT_TARGET);
}

/* ---------------------------------------------------
    Descarga global de 30 videos
--------------------------------------------------- */
export async function download30() {
  await ensureTemp();

  const results = [];
  const tiktokUrls = await gatherTikTokUrls();
  const ytUrls = await gatherYouTubeShorts();

  const all = [...tiktokUrls, ...ytUrls].slice(0, 30);

  for (let i = 0; i < all.length; i++) {
    const item = all[i];
    const outName = `viral_${i+1}.mp4`;
    const outPath = path.join(TEMP_DIR, outName);

    try {
      console.log("Descargando:", item);
      await runYtDlp(item, outPath);

      // Validación del archivo
      const stat = await fs.stat(outPath);
      if (stat.size < 200 * 1024) throw new Error("Archivo demasiado pequeño → posible fallo");

      console.log("Guardado:", outPath);
      results.push(outPath);

    } catch (e) {
      console.warn("Fallo descarga:", item, e.toString());

      // Guardar fallback txt
      const txtPath = path.join(TEMP_DIR, outName.replace(".mp4",".txt"));
      await fs.writeFile(txtPath, String(item));
      results.push(txtPath);
    }
  }

  return results;
}
