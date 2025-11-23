// ... importaciones existentes
import Curator from './curator.js'; 
import Publisher from './publisher.js'; // <-- NUEVO: Módulo de Publicación

async function main() {
  try {
    // 1. Fase de Scraping: Obtener URLs y Metadatos
    console.log("--- FASE 1: OBTENCIÓN DE METADATOS ---");
    let videoList = await VideoScraper.run();

    // 2. Fase de Descarga
    console.log("\n--- FASE 2: DESCARGA DE ARCHIVOS ---");
    videoList = await Downloader.run(videoList);
    
    // 3. Fase de Curación (FFmpeg)
    console.log("\n--- FASE 3: CURACIÓN CON WATERMARK ---");
    videoList = await Curator.run(videoList); 

    // 4. Fase de Publicación <-- NUEVO: Ejecutar el publicador
    console.log("\n--- FASE 4: PUBLICACIÓN EN REDES ---");
    await Publisher.run(videoList);

    console.log("\n--- FLUJO COMPLETO FINALIZADO ---");
    
  } catch (error) {
    console.error("\n💀 Error fatal en el flujo principal:", error.message);
    process.exit(1);
  }
}

main();

main();
