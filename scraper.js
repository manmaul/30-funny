import fs from 'fs/promises';
import path from 'path';

const OUTPUT_FILE = path.join(process.cwd(), 'data', 'video_list.json');

// --- CONSTANTES DE PRUEBA ---
// Usamos un URL directo de un archivo MP4 estable (Big Buck Bunny) para evitar que YouTube lo bloquee.
const STABLE_MP4_URL = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const TIKTOK_COUNT = 25;
const REEL_COUNT = 5;

/**
 * Genera una lista de videos de prueba.
 */
function generateSampleVideos(count, plataforma, isReel = false, offset = 0) {
    const videos = [];

    for (let i = 0; i < count; i++) {
        videos.push({
            id: `${plataforma}-${i + offset}`,
            url: STABLE_MP4_URL, // Usamos el URL estable para todos los videos
            plataforma: plataforma,
            isReel: isReel,
            channel: 'Stable Video Test',
            description: `Video de prueba ${i + 1 + offset} para la plataforma ${plataforma}.`
        });
    }

    return videos;
}


const VideoScraper = {
    // FUNCIÓN 'RUN'
    async run() {
        console.log('Buscando 25 TikToks y 5 Reels...');

        // 1. Generar lista de TikToks (25 videos)
        const tiktokVideos = generateSampleVideos(TIKTOK_COUNT, 'tiktok');

        // 2. Generar lista de Reels (5 videos)
        const reelVideos = generateSampleVideos(REEL_COUNT, 'instagram', true, TIKTOK_COUNT);

        // 3. Combinar las listas
        const videoList = [...tiktokVideos, ...reelVideos];

        // 4. Guardar los metadatos
        await fs.writeFile(OUTPUT_FILE, JSON.stringify(videoList, null, 2));

        console.log(`✅ Metadatos de ${videoList.length} videos guardados en ${OUTPUT_FILE}`);
        return videoList;
    }
};

export default VideoScraper;
