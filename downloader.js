// downloader.js
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

const DOWNLOADS_DIR = path.join(process.cwd(), 'descargas');
const OUTPUT_LIST_FILE = path.join(process.cwd(), 'data', 'downloaded_list.json');

// Helper para ejecutar comandos de yt-dlp y capturar la salida
function executeYtDlp(args) {
    return new Promise((resolve) => {
        const child = spawn('yt-dlp', args);
        let output = '';
        let error = '';

        child.stdout.on('data', (data) => {
            output += data.toString();
        });

        child.stderr.on('data', (data) => {
            error += data.toString();
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve({ success: true, output, error });
            } else {
                resolve({ success: false, output, error, code });
            }
        });
        
        child.on('error', (err) => {
            resolve({ success: false, error: `Fallo al iniciar el proceso yt-dlp: ${err.message}`, code: 1 });
        });
    });
}

/**
 * Obtiene la duración del video usando la salida JSON de yt-dlp.
 */
async function getVideoDuration(url) {
    const args = [
        '--dump-json',
        '--flat-playlist', // Modo más rápido para obtener solo metadatos
        '--extractor-args', 'youtube:player_client=default', 
        url
    ];

    const result = await executeYtDlp(args);

    if (result.success && result.output) {
        try {
            // yt-dlp a veces devuelve múltiples JSONs, tomamos el primero
            const jsonText = result.output.trim().split('\n')[0]; 
            const data = JSON.parse(jsonText);
            return data.duration || Infinity; // Devolvemos duración o Infinito si no se encuentra
        } catch (e) {
            console.error(`Error al parsear JSON de duración para ${url}: ${e.message}`);
            return Infinity; 
        }
    } else {
        console.error(`Error al obtener metadatos para ${url}.`);
        return Infinity; // Saltar si falla la obtención de metadatos
    }
}

/**
 * Ejecuta la descarga real del video.
 */
function runYtDlpDownload(url, outputPath) {
    return new Promise(async (resolve) => {
        
        const args = [
            '-o', outputPath,
            '--restrict-filenames',
            '-S', 'ext:mp4:m4a,height:1080',
            '--extractor-args', 'youtube:player_client=default', 
            url
        ];

        console.log(`  > Ejecutando descarga: yt-dlp ${args.join(' ')}`);

        const result = await executeYtDlp(args);
        
        // Manejar condición de éxito "ya descargado"
        const alreadyDownloaded = result.error.includes('has already been downloaded');
        
        if (result.success || alreadyDownloaded) {
            console.log(`✅ Descargado con éxito: ${url}`);
            resolve({ success: true });
        } else {
            console.log(`❌ Error al descargar ${url}: Command failed with exit code ${result.code}\n${result.error}`);
            resolve({ success: false, error: result.error });
        }
    });
}


const VideoDownloader = {
  // FUNCIÓN 'RUN'
  async run(videoList) {
    console.log(`Comenzando la descarga de ${videoList.length} videos...`);

    await fs.mkdir(DOWNLOADS_DIR, { recursive: true });
    
    const downloadedList = [];
    let videosToProcess = videoList;

    // Si la lista de entrada está vacía, lee la lista guardada de la FASE 1
    if (videosToProcess.length === 0) {
        try {
            const data = await fs.readFile(path.join(process.cwd(), 'data', 'video_list.json'), 'utf-8');
            videosToProcess = JSON.parse(data);
        } catch (e) {
            console.log("No se encontró una lista de videos para descargar.");
            return [];
        }
    }


    for (let i = 0; i < videosToProcess.length; i++) {
        const video = videosToProcess[i];
        const outputFilename = `${video.id}.%(ext)s`;
        const outputPath = path.join(DOWNLOADS_DIR, outputFilename);

        console.log(`\nProcesando (${i + 1}/${videosToProcess.length}): ${video.url}`);
        
        // --- 1. PRE-CHECK DE DURACIÓN ---
        const duration = await getVideoDuration(video.url);

        if (duration > 59) {
            console.log(`⚠️ Saltando ${video.id}. Duración (${duration}s) supera el límite de 59s.`);
            continue; // Saltar al siguiente video
        }
        
        if (duration === Infinity) {
            // Este caso ya fue manejado por la función getVideoDuration
            continue; 
        }

        console.log(`Duración OK (${duration}s). Procediendo a la descarga...`);

        // --- 2. DESCARGA REAL ---
        try {
            const result = await runYtDlpDownload(video.url, outputPath);
            
            if (result.success) {
                video.local_path = outputPath.replace('.%(ext)s', '.mp4'); 
                downloadedList.push(video);
            }
        } catch (e) {
            console.error(`Error fatal en el proceso de descarga para ${video.url}: ${e.message}`);
        }
    }
    
    await fs.writeFile(OUTPUT_LIST_FILE, JSON.stringify(downloadedList, null, 2));

    console.log(`\n✅ ${downloadedList.length} videos descargados y validados con éxito.`);

    return downloadedList;
  }
};

export default VideoDownloader;
