// scraper.js
import fs from 'fs/promises';
import path from 'path';
// Importamos los módulos stealth
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Registrar el plugin stealth
puppeteer.use(StealthPlugin());


const OUTPUT_LIST_FILE = path.join(process.cwd(), 'data', 'video_list.json');

// --- CONFIGURACIÓN DE BÚSQUEDA ---
const HASHTAGS = [
    'humor', 'humorvideos', 'viral', 'virales', 'funnyvideos', 
    'funny', 'lol', 'lolvideos', 'memes', 'gracioso', 
    'memeslatinos', 'chistes', 'bromas', 'fyp', 'reels', 
    'parati', 'viralvideos', 'viralreels', 'viralpost', 
    'viralvideo'
];
const TIKTOK_COUNT = 25; 
const REELS_COUNT = 5;  

const SAMPLE_URL = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const VideoScraper = {
    // ... (el resto del código de run() permanece igual)
    // ...
    
    // --- LÓGICA DE SCRAPING DE TIKTOK ---
    async scrapeTikTok() {
        const randomHashtag = HASHTAGS[Math.floor(Math.random() * HASHTAGS.length)];
        const url = `https://www.tiktok.com/tag/${randomHashtag}`;

        // *** CAMBIO CLAVE: Lanzar Puppeteer con el plugin stealth ***
        const browser = await puppeteer.launch({ 
            headless: true,
            // Argumentos comunes para evitar detección
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        }); 
        
        const page = await browser.newPage();
        
        // La navegación y la espera permanecen con el timeout de 45s
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 }); 

        // Esperar el selector de videos
        // Nota: Si el selector de videos no funciona después de esto, 
        // significa que TikTok lo ha cambiado, y tendríamos que encontrar uno nuevo.
        await page.waitForSelector('div[data-e2e="challenge-item"]', { timeout: 45000 });
// ...
