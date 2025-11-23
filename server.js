// server.js - Replit / Railway friendly microservice
import express from "express";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";
const execFileP = promisify(execFile);

const app = express();
app.use(express.json({ limit: "50mb" }));

const TMP = "./tmp";
if (!fs.existsSync(TMP)) fs.mkdirSync(TMP);

app.post("/download", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ ok:false, error:"no url" });
  try {
    const name = "video_" + Date.now() + ".%(ext)s";
    const out = path.join(TMP, name);
    // yt-dlp arguments: best mp4, no playlist, quiet
    await execFileP("yt-dlp", ["-f", "bestvideo[ext=mp4]+bestaudio/best", "-o", out, url], { timeout: 120000 });
    // yt-dlp will write a file; find it
    const files = fs.readdirSync(TMP).filter(f => f.startsWith("video_"));
    const latest = files.sort().pop();
    const filepath = path.join(TMP, latest);
    // return file as binary (small-scale) — Replit can serve files
    const stat = fs.statSync(filepath);
    res.setHeader("content-type","video/mp4");
    res.setHeader("content-length", stat.size);
    const stream = fs.createReadStream(filepath);
    stream.pipe(res);
    // optionally delete after some time via setTimeout
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok:false, error: String(e) });
  }
});

app.get("/", (req,res)=>res.send("yt-dlp microservice OK"));
const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log("listening", port));
