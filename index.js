import express from "express";
import cors from "cors";
import TikTokScraper from "./scraper.js";

const app = express();
app.use(cors());

// Timeout global para evitar cuelgues (60s)
app.use((req, res, next) => {
  res.setTimeout(60000, () => {
    console.error("⏳ Timeout de petición:", req.originalUrl);
    return res.status(504).json({ ok: false, error: "Timeout del servidor" });
  });
  next();
});

// Logger simple
app.use((req, res, next) => {
  console.log(`🟢 ${req.method} ${req.originalUrl}`);
  next();
});

// Root
app.get("/", (req, res) => {
  res.send("Servidor activo: 30-funny");
});

// --- Helper para manejar errores uniformemente ---
function safeError(err) {
  if (!err) return "Error desconocido";

  if (typeof err === "string") return err;

  if (err.message) return err.message;

  try {
    return JSON.stringify(err).slice(0, 300);
  } catch {
    return "Error inesperado";
  }
}

//
