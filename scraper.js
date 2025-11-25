// scraper.js
import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';

const OUTPUT_LIST_FILE = path.join(process.cwd(), 'data', 'video_list.json');

// --- CONFIGURACIÓN DE BÚSQUEDA ---
// Lista de hashtags proporcionada por el usuario
const HASHTAGS = [
    'humor', 'humorvideos', 'viral', 'virales', 'funnyvideos', 
    'funny', 'lol', 'lolvideos', 'memes', 'gracioso', 
    'memeslatinos', 'chistes', 'bromas', 'fyp', 'reels', 
    'parati', 'viralvideos', 'viralreels', 'viralpost', 
    'viralvideo'
];
const TIKTOK_COUNT = 25; // <--- CORREGIDO: 25 videos
const REELS_COUNT = 5;  // 5 videos

// URL de prueba para el fallback (si el scraping falla)
const SAMPLE_URL = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const VideoScraper = {
    async run() {
        console.log(`Buscando ${TIKTOK_COUNT} videos de TikTok y ${REELS_COUNT} de Instagram Reels de los hashtags más virales.`);

        let videoList = [];
        
        // --- PROCESAMIENTO DE TIKTOK (BETA con Puppeteer) ---
        console.log(`\n> Iniciando scraping en TikTok (buscando los más populares de los ${HASHTAGS.length} hashtags)...`);
        try {
            const tiktokVideos = await this.scrapeTikTok();
            videoList.push(...tiktokVideos.slice(0, TIKTOK_COUNT));
        } catch (e) {
            console.error(`❌ Error al intentar el scraping de TikTok. Usando URLs de prueba si es necesario.`, e.message);
            // Fallback a samples si el scraping falla
            videoList.push(...this.generateSampleVideos('tiktok', TIKTOK_COUNT)); 
        }

        // --- PROCESAMIENTO DE INSTAGRAM REELS (SIMULADO) ---
        console.log(`\n> Simulando scraping en Instagram Reels (usando URLs de prueba)...`);
        videoList.push(...this.generateSampleVideos('instagram', REELS_COUNT, videoList.length));

        // Limpiar y asegurar el conteo total (25 + 5 = 30)
        const finalVideos = videoList.slice(0, TIKTOK_COUNT + REELS_COUNT);

        await fs.writeFile(OUTPUT_LIST_FILE, JSON.stringify(finalVideos, null, 2));
        console.log(`\n✅ Metadatos de ${finalVideos.length} videos (Virales/Simulados) guardados en ${OUTPUT_LIST_FILE}`);
        
        return finalVideos;
    },

    // --- LÓGICA DE SCRAPING DE TIKTOK (Implementación de prueba de Puppeteer) ---
    async scrapeTikTok() {
        // Seleccionamos un hashtag aleatorio de la lista para simular la búsqueda rotativa.
        const randomHashtag = HASHTAGS[Math.floor(Math.random() * HASHTAGS.length)];
        const url = `https://www.tiktok.com/tag/${randomHashtag}`;

        // Usamos { headless: true } para un rendimiento rápido en la automatización
        const browser = await puppeteer.launch({ headless: true }); 
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Esperar el selector de videos más virales (generalmente en la parte superior)
        await page.waitForSelector('div[data-e2e="challenge-item"]', { timeout: 15000 });

        const videos = await page.evaluate((count) => {
            const results = [];
            // Selecciona los videos en la primera sección ("más virales")
            const videoElements = document.querySelectorAll('div[data-e2e="challenge-item"]');
            
            // Buscamos el doble del necesario para tener margen y poder seleccionar los "más virales"
            for (let i = 0; i < Math.min(count * 2, videoElements.length); i++) {
                const element = videoElements[i];
                const link = element.querySelector('a')?.href;
                
                if (link) {
                    const videoId = link.split('/video/')[1]?.split('?')[0] || `tiktok-real-${i}`;
                    
                    results.push({
                        id: videoId,
                        url: link, // URL de la página del video (yt-dlp extrae el mp4)
                        platform: 'TikTok',
                        title: `TikTok #${videoId} (${randomHashtag})`,
                        virality_score: i // Posición como proxy de la virilidad
                    });
                }
            }
            return results;
        }, TIKTOK_COUNT); 

        await browser.close();
        return videos;
    },

    // --- FUNCIÓN DE GENERACIÓN DE PRUEBAS (FALLBACK) ---
    generateSampleVideos(platform, count, startIndex = 0) {
        const samples = [];
        for (let i = 0; i < count; i++) {
            samples.push({
                id: `${platform}-${startIndex + i}`,
                url: SAMPLE_URL,
                platform: platform === 'tiktok' ? 'TikTok' : 'Instagram Reels',
                title: `[SAMPLE] ${platform} #${startIndex + i}`
            });
        }
        return samples;
    }
};

export default VideoScraper;
