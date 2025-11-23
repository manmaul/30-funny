// downloader.js
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

const DOWNLOADS_DIR = path.join(process.cwd(), 'descargas');
const OUTPUT_LIST_FILE = path.join(process.cwd(), 'data', 'downloaded_list.json');

/**
 * Ejecuta un comando de yt-dlp para descargar el video.
 */
function runYtDlpCommand(url, outputPath, videoId) {
  return new Promise((resolve, reject) => {
    
    const args = [
      '-o', outputPath,
      '--restrict-filenames',
      // Argumento para seleccionar el mejor stream (mp4 o m4a) y una altura máxima de 1080p
      '-S', 'ext:mp4:m4a,height:1080',
      // ARGUMENTO REINTRODUCIDO: Limita la descarga a 59 segundos
      '--max-duration', '59', 
      // Este argumento asegura que yt-dlp funcione con la URL estable de Big Buck Bunny
      '--extractor-args', 'youtube:player_client=default', 
      url
    ];

    console.log(`Ejecutando: yt-dlp ${args.join(' ')}`);

    const child = spawn('yt-dlp', args);
    let errorOutput = '';
    let success = false;

    child.stderr.on('data', (data) => {
      const output = data.toString();
      errorOutput += output;
      // Una forma simple de detectar si la descarga fue exitosa
      if (output.includes('has already been downloaded')) {
        success = true;
      }
    });

    child.on('close', (code) => {
      if (code === 0 || success) {
        console.log(`✅ Descargado con éxito: ${url}`);
        resolve({ success: true, local_path: outputPath });
      } else {
        console.log(`❌ Error al descargar ${url}: Command failed with exit code ${code}\n${errorOutput}`);
        resolve({ success: false, error: errorOutput });
      }
    });

    child.on('error', (err) => {
      reject(new Error(`Fallo al iniciar el proceso yt-dlp: ${err.message}`));
    });
  });
}

const VideoDownloader = {
  // FUNCIÓN 'RUN'
  async run(videoList) {
    console.log(`Comenzando la descarga de ${videoList.length} videos...`);

    // Asegurar que la carpeta 'descargas' existe
    await fs.mkdir(DOWNLOADS_DIR, { recursive: true });
    
    const downloadedList = [];

    for (const video of videoList) {
      const outputFilename = `${video.id}.%(ext)s`;
      const outputPath = path.join(DOWNLOADS_DIR, outputFilename);

      console.log(`Descargando (${downloadedList.length + 1}/${videoList.length}): ${video.url}`);

      try {
        const result = await runYtDlpCommand(video.url, outputPath, video.id);
        
        if (result.success) {
          // El nombre del archivo finaliza con .mp4 (o el formato descargado)
          video.local_path = outputPath.replace('.%(ext)s', '.mp4'); 
          downloadedList.push(video);
        }
      } catch (e) {
        console.error(`Error fatal en el proceso de descarga para ${video.url}: ${e.message}`);
      }
    }
    
    // Guardar la lista de videos descargados para la FASE 3
    await fs.writeFile(OUTPUT_LIST_FILE, JSON.stringify(downloadedList, null, 2));

    return downloadedList;
  }
};

export default VideoDownloader;
