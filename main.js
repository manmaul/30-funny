// main.js
import VideoScraper from './scraper.js';
import VideoDownloader from './downloader.js';
import VideoCurator from './curator.js'; 
import VideoPublisher from './publisher.js'; // Importación de la FASE 4

async function main() {
    console.log('--- FASE 1: OBTENCIÓN DE METADATOS ---');
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
    
    console.log('\n--- FASE 3: CURACIÓN CON WATERMARK ---');
    let curatedVideos = [];
    try {
        // VideoCurator.run() lee la lista de descargados de disco.
        curatedVideos = await VideoCurator.run(); 
    } catch (e) {
        console.error('💀 Error fatal en la FASE 3:', e.message);
        return;
    }

    // --- FASE 4: PUBLICACIÓN EN REDES ---
    console.log('\n--- FASE 4: PUBLICACIÓN EN REDES ---');
    if (curatedVideos.length > 0) {
        let publicationReport = [];
        try {
            // VideoPublisher.run publica los videos curados
            publicationReport = await VideoPublisher.run(curatedVideos); 
        } catch (e) {
            console.error('💀 Error fatal en la FASE 4:', e.message);
        }
    } else {
        console.log('No hay videos curados para publicar.');
    }


    console.log('\n--- FLUJO COMPLETO FINALIZADO ---');
}

main();
