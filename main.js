import VideoScraper from './scraper.js';
import Downloader from './downloader.js';
// Importaremos Curator en el siguiente paso
// import Curator from './curator.js'; 

async function main() {
  try {
    // 1. Fase de Scraping: Obtener URLs y Metadatos
    let videoList = await VideoScraper.run();

    // 2. Fase de Descarga
    videoList = await Downloader.run(videoList);
    
    // 3. Fase de Curación (FFmpeg) - Pendiente de implementar Curator.js
    // videoList = await Curator.run(videoList); 

    console.log("\n--- Resumen del Flujo ---");
    console.log(`Videos listos para curar: ${videoList.length}`);
    console.log("Siguiente paso: Implementar curator.js (FFmpeg) para el watermark mínimo.");

  } catch (error) {
    console.error("\n💀 Error fatal en el flujo principal:", error.message);
    process.exit(1);
  }
}

main();
