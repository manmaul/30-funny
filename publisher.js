// publisher.js
import fs from 'fs/promises';
import path from 'path';

const INPUT_LIST_FILE = path.join(process.cwd(), 'data', 'curated_list.json');
const OUTPUT_REPORT_FILE = path.join(process.cwd(), 'data', 'publication_report.json');

const VideoPublisher = {
    // FUNCIÓN 'RUN'
    async run(curatedVideos) {
        if (curatedVideos.length === 0) {
            console.log('No hay videos curados para publicar.');
            return;
        }

        console.log(`Comenzando la simulación de publicación de ${curatedVideos.length} videos...`);
        
        const publicationReport = [];

        for (const video of curatedVideos) {
            // Simulación: Elegir una plataforma de publicación basada en la plataforma original
            const platform = video.plataforma === 'tiktok' ? 'TikTok' : 'Instagram Reels';
            
            // Simulación: Generar un ID de publicación y un estado
            const publicationId = `pub-${Math.random().toString(36).substr(2, 9)}`;

            // Simulación de la subida a la API
            await new Promise(resolve => setTimeout(resolve, 50)); // Pequeña pausa para simular el tiempo de subida

            const publishedData = {
                ...video,
                published_on: platform,
                publication_id: publicationId,
                status: 'PUBLICADO_SIMULADO',
                timestamp: new Date().toISOString()
            };
            
            publicationReport.push(publishedData);
            console.log(`✅ SIMULADO: Publicado ${path.basename(video.curated_path)} en ${platform} (ID: ${publicationId})`);
        }

        // Guardar el reporte final
        await fs.writeFile(OUTPUT_REPORT_FILE, JSON.stringify(publicationReport, null, 2));

        console.log(`\n✅ Simulación de publicación de ${publicationReport.length} videos completada.`);
        console.log(`Reporte guardado en ${OUTPUT_REPORT_FILE}`);

        return publicationReport;
    }
};

export default VideoPublisher;
