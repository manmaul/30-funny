// downloader.js
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

const DOWNLOADS_DIR = path.join(process.cwd(), 'descargas');
const OUTPUT_LIST_FILE = path.join(process.cwd(), 'data', 'downloaded_list.json');

// Helper para ejecutar comandos de yt-dlp y capturar la salida
function executeYtDlp(args) {
    return new new Promise((resolve) => {
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
                resolve({ success: true, output: output.trim(), error });
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
 * Obtiene la duración del video usando --get-duration (salida de texto simple).
 */
async function getVideoDuration(url) {
    const args = [
        '--get-duration', 
        '--extractor-args', 'youtube:player_client=default', 
        url
    ];

    const result = await executeYtDlp(args);

    if (result.success && result.output) {
        try {
            // El output es típicamente HH:MM:SS o MM:SS
            const outputTime = result.output.split('\n')[0].trim();
            const timeParts = outputTime.split(':').map(Number);
            let durationSeconds = 0;
            
            // Convertir la cadena de tiempo a segundos
            if (timeParts.length === 3) { // HH:MM:SS
                durationSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
            } else if (timeParts.length === 2) { // MM:SS
                durationSeconds = timeParts[0] * 60 + timeParts[1];
            } else if (timeParts.length === 1) { // SS
                durationSeconds = timeParts[0];
            }
            
            if (isNaN(durationSeconds) || durationSeconds <= 0) {
                return Infinity;
            }
            return durationSeconds; 
        } catch (e) {
            console.error(`Error al procesar la duración para ${url}: ${e.message}`);
            return Infinity; 
        }
    } else {
        return Infinity; 
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
        
        if (duration === Infinity) {
             console.log(`⚠️ Saltando ${video.id}. Falló la obtención de duración/metadatos.`);
             continue;
        }
        
        if (duration > 59) {
            console.log(`⚠️ Saltando ${video.id}. Duración (${duration}s) supera el límite de 59s.`);
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
