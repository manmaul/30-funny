import express from "express";
import { getTikTokTop30 } from "./src/tiktok.js";

const app = express();
const PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("Funny Scraper Running ✔");
});

app.get("/scrape/tiktok", async (req, res) => {
  try {
    const data = await getTikTokTop30();
    res.json({ ok: true, total: data.length, videos: data });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log("🚀 Servidor iniciado en puerto", PORT);
});
