import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import TikTokScraper from "./scraper.js";

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("Servidor activo: 30-funny");
});

app.get("/scrape/tiktok", async (req, res) => {
  try {
    const data = await TikTokScraper.scrapeTikTok();
    res.json({ ok: true, videos: data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/scrape/youtube", async (req, res) => {
  try {
    const data = await TikTokScraper.scrapeYouTube();
    res.json({ ok: true, videos: data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Servidor operativo en puerto", PORT));

