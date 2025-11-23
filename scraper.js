// scraper.js
import fs from 'fs/promises';
import path from 'path';

const OUTPUT_LIST_FILE = path.join(process.cwd(), 'data', 'video_list.json');

// Usamos URLs estables y genéricas para la simulación.
const SAMPLE_URL = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const VideoScraper = {
    async run() {
        console.log('Buscando 25 TikToks y 5 Reels...');

        const videoList = [];

        // Generar 25 videos simulados para TikTok
        for (let i = 0; i < 25; i++) {
            videoList.push({
                id: `tiktok-${i}`,
                url: SAMPLE_URL,
                platform: 'TikTok',
                title: `Momento divertido TikTok #${i}`
            });
        }

        // Generar 5 videos simulados para Instagram Reels
        for (let i = 25; i < 30; i++) {
            videoList.push({
                id: `instagram-${i}`,
                url: SAMPLE_URL,
                platform: 'Instagram Reels',
                title: `Reel viral Instagram #${i}`
            });
        }

        await fs.writeFile(OUTPUT_LIST_FILE, JSON.stringify(videoList, null, 2));
        console.log(`✅ Metadatos de ${videoList.length} videos guardados en ${OUTPUT_LIST_FILE}`);
        
        return videoList;
    }
};

export default VideoScraper;
