// Este módulo intenta obtener 25 URLs de TikTok y 5 de YouTube Shorts
// y las descarga localmente usando `yt-dlp` (que debe estar instalado en el host).
import { execFile } from "child_process";
import fs from "fs/promises";
import path from "path";
import got from "got";
import cheerio from "cheerio";

const TEMP_DIR = "./temp_videos";
const TIKTOK_TARGET = 25;
const YT_TARGET = 5;
const HASHTAGS = ["humor","funny","graciosos","divertidos","lol","memesvirales"];

function runYtDlp(url, outPath) {
  return new Promise((resolve, reject) => {
    const args = ["-f", "bestvideo[ext=mp4]+bestaudio/best/best", "-o", outPath, url];
    execFile("yt-dlp", args, { maxBuffer: 1024*1024*200 }, (err, stdout, stderr) => {
      if (err) return reject(stderr || err);
      resolve(stdout);
    });
  });
}

async function ensureTemp() {
  await fs.mkdir(TEMP_DIR, { recursive: true });
}

async function scrapeTikTokByTag(tag, limit=10) {
  const urls = [];
  try {
    const res = await got(`https://www.tiktok.com/tag/${encodeURIComponent(tag)}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      timeout: 15000
    });
    const $ = cheerio.load(res.body);
    $("a").each((i, el) => {
      const href = $(el).attr("href");
      if (href && href.includes("/video/")) {
        const full = href.startsWith("http") ? href : ("https://www.tiktok.com" + href);
        urls.push(full);
      }
    });
  } catch (e) {
    console.warn("Scrape tiktok error for", tag, e.message);
  }
  // unique
  return [...new Set(urls)].slice(0, limit);
}

async function gatherTikTokUrls() {
  const all = [];
  for (const tag of HASHTAGS) {
    const part = await scrapeTikTokByTag(tag, 15);
    all.push(...part);
    if (all.length >= TIKTOK_TARGET) break;
  }
  return [...new Set(all)].slice(0, TIKTOK_TARGET);
}

async function gatherYouTubeShorts() {
  // fallback simple: use yt-dlp search short syntax
  const urls = [];
  for (const tag of HASHTAGS) {
    urls.push(`ytsearch${Math.ceil(YT_TARGET/ HASHTAGS.length) || 2}:shorts ${tag}`);
    if (urls.length >= YT_TARGET) break;
  }
  return urls.slice(0, YT_TARGET);
}

export async function download30() {
  await ensureTemp();
  const results = [];
  const tiktokUrls = await gatherTikTokUrls();
  const ytUrls = await gatherYouTubeShorts();

  const all = [...tiktokUrls.slice(0, TIKTOK_TARGET), ...ytUrls.slice(0, YT_TARGET)].slice(0, 30);

  for (let i=0;i<all.length;i++) {
    const item = all[i];
    const outName = `viral_${i+1}.mp4`;
    const outPath = path.join(TEMP_DIR, outName);
    try {
      console.log("Descargando:", item);
      await runYtDlp(item, outPath);
      console.log("Guardado:", outPath);
      results.push(outPath);
    } catch (e) {
      console.warn("Fallo descarga:", item, e.toString?.() || e);
      // si falla, crear un txt con la URL para que Apps Script pueda procesarla despues
      const txtPath = path.join(TEMP_DIR, outName.replace(".mp4",".txt"));
      await fs.writeFile(txtPath, String(item));
      results.push(txtPath);
    }
  }

  return results;
}
