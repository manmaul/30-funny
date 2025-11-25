// main.js
import VideoScraper from './scraper.js';
import VideoDownloader from './downloader.js';
import VideoCurator from './curator.js'; 
import VideoPublisher from './publisher.js'; 
import VideoUploader from './uploader.js'; // <-- NUEVO

async function main() {
    console.log('--- FASE 1: OBTENCIÓN DE METADATOS Y VIRALES ---');
    let videoList = [];
    try {
        videoList = await VideoScraper.run();
    } catch (e) {
        console.error('💀 Error fatal en la FASE 1:', e.message);
        return;
    }

    console.log('\n--- FASE 2: DESCARGA DE ARCHIVOS ---');
    let downloadedVideos = [];
    try {
        downloadedVideos = await VideoDownloader.run(videoList);
    } catch (e) {
        console.error('💀 Error fatal en la FASE 2:', e.message);
        return;
    }
    
    console.log('\n--- FASE 3: CURACIÓN CON WATERMARK Y OPTIMIZACIÓN ---');
    let curatedVideos = [];
    try {
        curatedVideos = await VideoCurator.run(); 
    } catch (e) {
        console.error('💀 Error fatal en la FASE 3:', e.message);
        return;
    }

    // --- FASE 4: SUBIDA A GOOGLE DRIVE (ALMACENAMIENTO) ---
    console.log('\n--- FASE 4: SUBIDA A GOOGLE DRIVE (ALMACENAMIENTO) ---');
    let uploadedVideos = [];
    if (curatedVideos.length > 0) {
        try {
            uploadedVideos = await VideoUploader.run(); 
        } catch (e) {
            console.error('💀 Error fatal en la FASE 4 (Uploader):', e.message);
            uploadedVideos = curatedVideos; // Usar la lista curada si la subida falla
        }
    } else {
        console.log('No hay videos curados para subir a Drive.');
    }
    
    // --- FASE 5: SIMULACIÓN DE PUBLICACIÓN (PASO MANUAL FINAL) ---
    console.log('\n--- FASE 5: SIMULACIÓN DE PUBLICACIÓN (PASO MANUAL FINAL) ---');
    if (uploadedVideos.length > 0) {
        try {
            // VideoPublisher.run ahora recibe los videos con sus links de Drive (simulados)
            await VideoPublisher.run(uploadedVideos); 
        } catch (e) {
            console.error('💀 Error fatal en la FASE 5 (Publisher):', e.message);
        }
    } else {
        console.log('No hay videos listos para el paso de publicación.');
    }

    console.log('\n--- FLUJO COMPLETO FINALIZADO ---');
}

main();
