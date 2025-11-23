import fs from 'fs/promises';
import path from 'path';
import fetch from "node-fetch"; 

// LISTA DE HASHTAGS
const HASHTAGS = ["funny", "humor", "lol", "memes", "viral", "shorts", "funnyvideos", "lolvideos", "viralvideos", "graciosos"];

const TIKTOK_COUNT = 25;
const REELS_COUNT = 5;

const OUT_FILE = path.join(process.cwd(), 'data', 'video_list.json');

// ID de un video de YouTube de muestra que SÍ está disponible
const SAMPLE_YOUTUBE_ID = 'iZk9s7xVbU0'; 

const VideoScraper = {
  // --- Simulación de Scraping ---
  async _scrapeTikTok() {
    const videos = [];
    for (let i = 1; i <= TIKTOK_COUNT; i++) {
      videos.push({
        plataforma: 'tiktok',
        titulo: `TikTok Viral ${i}: La caida épica`,
        // URL de YouTube funcional, usando un timestamp diferente para simular videos distintos
        url: `https://www.youtube.com/watch?v=${SAMPLE_YOUTUBE_ID}&t=${i}`, 
        autor_handle: `@creator_tiktok${i}`, 
        vistas: Math.floor(Math.random() * 5000000)
      });
    }
    return videos;
  },

  async _scrapeReels() {
    const videos = [];
    for (let i = 1; i <= REELS_COUNT; i++) {
      videos.push({
        plataforma: 'instagram',
        titulo: `Reel de Humor ${i}: El gato con actitud`,
        // URL de YouTube funcional, usando un timestamp diferente para simular videos distintos
        url: `https://www.youtube.com/watch?v=${SAMPLE_YOUTUBE_ID}&t=${i + 100}`, 
        autor_handle: `@creator_reel${i}`, 
        vistas: Math.floor(Math.random() * 3000000)
      });
    }
    return videos;
  },
  // --------------------------------

  // FUNCIÓN 'RUN'
  async run() {
    console.log(`Buscando ${TIKTOK_COUNT} TikToks y ${REELS_COUNT} Reels...`);
    
    const tiktokVideos = await this._scrapeTikTok(); 
    const reelsVideos = await this._scrapeReels(); 
    
    const allVideos = [...tiktokVideos, ...reelsVideos];

    // Asegurar que la carpeta 'data' existe
    await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
    
    // Guardar los metadatos en un archivo JSON para el siguiente paso
    await fs.writeFile(OUT_FILE, JSON.stringify(allVideos, null, 2));
    
    console.log(`✅ Metadatos de ${allVideos.length} videos guardados en ${OUT_FILE}`);
    return allVideos;
  }
}; 

export default VideoScraper;
