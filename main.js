// main.js
import VideoScraper from './scraper.js';
import VideoDownloader from './downloader.js';
import VideoCurator from './curator.js'; // <<-- NUEVA IMPORTACIÓN
// import VideoPublisher from './publisher.js'; // <-- Lo implementaremos después

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
    
    // --- NUEVA FASE 3 ---
    console.log('\n--- FASE 3: CURACIÓN CON WATERMARK ---');
    let curatedVideos = [];
    try {
        curatedVideos = await VideoCurator.run(downloadedVideos);
    } catch (e) {
        console.error('💀 Error fatal en la FASE 3:', e.message);
        return;
    }

    // --- FASE 4 (Pendiente de implementación) ---
    console.log('\n--- FASE 4: PUBLICACIÓN EN REDES ---');
    if (curatedVideos.length > 0) {
        // await VideoPublisher.run(curatedVideos); // Descomentar al implementar publisher.js
        console.log('Publicador no implementado, FASE 4 omitida.');
    } else {
        console.log('No hay videos curados para publicar.');
    }


    console.log('\n--- FLUJO COMPLETO FINALIZADO ---');
}

main();
