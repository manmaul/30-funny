// scraper.js
import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';

const OUTPUT_LIST_FILE = path.join(process.cwd(), 'data', 'video_list.json');

// --- CONFIGURACIÓN DE BÚSQUEDA ---
// Lista de hashtags para la búsqueda de contenido viral
const HASHTAGS = [
    'humor', 'humorvideos', 'viral', 'virales', 'funnyvideos', 
    'funny', 'lol', 'lolvideos', 'memes', 'gracioso', 
    'memeslatinos', 'chistes', 'bromas', 'fyp', 'reels', 
    'parati', 'viralvideos', 'viralreels', 'viralpost', 
    'viralvideo'
];
const TIKTOK_COUNT = 25; // Cantidad de videos de TikTok
const REELS_COUNT = 5;  // Cantidad de videos de Instagram Reels (simulados)

// URL de prueba para el fallback (si el scraping falla o para Reels)
const SAMPLE_URL = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const VideoScraper = {
    async run() {
        console.log(`Buscando ${TIKTOK_COUNT} videos de TikTok y ${REELS_COUNT} de Instagram Reels de los hashtags más virales.`);

        let videoList = [];
        
        // --- PROCESAMIENTO DE TIKTOK (BETA con Puppeteer y Timeout 45s) ---
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
        // Se mantiene la simulación debido a la complejidad y estabilidad de Instagram.
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
        // Seleccionamos un hashtag aleatorio para simular la búsqueda rotativa.
        const randomHashtag = HASHTAGS[Math.floor(Math.random() * HASHTAGS.length)];
        const url = `https://www.tiktok.com/tag/${randomHashtag}`;

        const browser = await puppeteer.launch({ headless: true }); 
        const page = await browser.newPage();
        
        // Aumentar el timeout de la navegación a 45 segundos para dar tiempo a la carga
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 }); 

        // Esperar el selector de videos con un timeout de 45 segundos
        await page.waitForSelector('div[data-e2e="challenge-item"]', { timeout: 45000 });

        const videos = await page.evaluate((count) => {
            const results = [];
            const videoElements = document.querySelectorAll('div[data-e2e="challenge-item"]');
            
            // Buscamos más del necesario para tener margen
            for (let i = 0; i < Math.min(count * 2, videoElements.length); i++) {
                const element = videoElements[i];
                const link = element.querySelector('a')?.href;
                
                if (link) {
                    const videoId = link.split('/video/')[1]?.split('?')[0] || `tiktok-real-${i}`;
                    
                    results.push({
                        id: videoId,
                        url: link, 
                        platform: 'TikTok',
                        title: `TikTok #${videoId} (${randomHashtag})`,
                        virality_score: i 
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
