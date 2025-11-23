// publisher.js
import fs from 'fs/promises';
import path from 'path';

const REPORT_DIR = path.join(process.cwd(), 'data');
const REPORT_FILE = path.join(REPORT_DIR, 'publication_report.json');

/**
 * Simula la subida de un archivo a una plataforma y devuelve un ID único.
 */
function simulateUpload(filename, platform) {
    // Generar un ID de publicación pseudo-aleatorio
    const pubId = 'pub-' + Math.random().toString(36).substring(2, 11);
    
    // Simular un delay
    const delay = Math.floor(Math.random() * 50) + 50; // 50ms a 100ms
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(`✅ SIMULADO: Publicado ${filename} en ${platform} (ID: ${pubId})`);
            resolve({
                filename: filename,
                platform: platform,
                publication_id: pubId,
                timestamp: new Date().toISOString()
            });
        }, delay);
    });
}

const VideoPublisher = {
    async run(curatedVideos) {
        console.log(`Comenzando la simulación de publicación de ${curatedVideos.length} videos...`);
        
        await fs.mkdir(REPORT_DIR, { recursive: true });

        const publicationPromises = curatedVideos.map(video => {
            const filename = path.basename(video.curated_path);
            return simulateUpload(filename, video.platform);
        });

        const publicationReport = await Promise.all(publicationPromises);

        // Guardar el reporte completo
        await fs.writeFile(REPORT_FILE, JSON.stringify(publicationReport, null, 2));

        console.log(`\n✅ Simulación de publicación de ${publicationReport.length} videos completada.`);
        console.log(`Reporte guardado en ${REPORT_FILE}`);

        return publicationReport;
    }
};

export default VideoPublisher;
