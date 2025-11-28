// url_extractor.js
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

const INPUT_PAGES_FILE = path.join(process.cwd(), 'data', 'input_pages.txt'); // Lista de URLs de TikTok/Reels
const OUTPUT_DIRECT_URLS_FILE = path.join(process.cwd(), 'data', 'direct_urls.txt'); // Lista de URLs directas de MP4

async function runYtDlpExtractor(url) {
    return new Promise((resolve, reject) => {
        // Opción -g: Extrae la URL de descarga directa
        const args = ['-g', url];
        
        const child = spawn('yt-dlp', args);
        let output = '';
        let errorOutput = '';

        child.stdout.on('data', (data) => {
            output += data.toString();
        });

        child.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        child.on('close', (code) => {
            if (code === 0) {
                // La URL de descarga directa es la primera línea del output
                resolve(output.trim().split('\n')[0]);
            } else {
                console.warn(`❌ No se pudo extraer la URL para ${url}. Error: ${errorOutput.substring(0, 100)}...`);
                resolve(null);
            }
        });
    });
}

async function extractUrls() {
    console.log('--- PASO 1: EXTRACCIÓN DE URLS DIRECTAS CON YT-DLP ---');
    
    let rawUrls;
    try {
        rawUrls = await fs.readFile(INPUT_PAGES_FILE, 'utf-8');
    } catch (e) {
        console.error(`❌ ERROR: No se encontró el archivo de páginas de entrada en ${INPUT_PAGES_FILE}.`);
        return;
    }

    const pages = rawUrls.split('\n').map(url => url.trim()).filter(url => url.length > 0);
    const directUrls = [];

    for (const pageUrl of pages) {
        console.log(`Procesando: ${pageUrl}`);
        const directUrl = await runYtDlpExtractor(pageUrl);
        if (directUrl) {
            directUrls.push(directUrl);
        }
    }

    await fs.writeFile(OUTPUT_DIRECT_URLS_FILE, directUrls.join('\n'));
    console.log(`\n✅ ${directUrls.length} URLs de descarga directa guardadas en ${OUTPUT_DIRECT_URLS_FILE}.`);
    console.log('Ahora puedes copiar el contenido de "direct_urls.txt" al script de Apps Script.');
}

// 1. Crea 'data/input_pages.txt' con las 30 URLs de TikTok/Reels (TÚ lo haces).
// 2. Ejecuta: node url_extractor.js
extractUrls();
