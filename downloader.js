// downloader.js
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

const DOWNLOADS_DIR = path.join(process.cwd(), 'descargas');
const OUTPUT_LIST_FILE = path.join(process.cwd(), 'data', 'downloaded_list.json');

/**
 * Ejecuta un comando de yt-dlp para descargar el video.
 */
function runYtDlpCommand(url, outputPath) {
  return new Promise((resolve, reject) => {
    
    // Configuración para una descarga simple y estable.
    const args = [
      '-o', outputPath,
      '--restrict-filenames',
      // Argumento para seleccionar el mejor stream y una altura máxima de 1080p
      '-S', 'ext:mp4:m4a,height:1080',
      // NO se incluyen filtros de duración ni argumentos de extractor específicos (youtube:player_client).
      url
    ];

    console.log(`Ejecutando: yt-dlp ${args.join(' ')}`);

    const child = spawn('yt-dlp', args);
    let errorOutput = '';
    let success = false;

    child.stderr.on('data', (data) => {
      const output = data.toString();
      errorOutput += output;
      // Detectar si la descarga fue exitosa o ya existía
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

    await fs.mkdir(DOWNLOADS_DIR, { recursive: true });
    
    const downloadedList = [];

    // Bucle sin filtro de duración
    for (const video of videoList) {
      const outputFilename = `${video.id}.%(ext)s`;
      const outputPath = path.join(DOWNLOADS_DIR, outputFilename);

      console.log(`Descargando (${downloadedList.length + 1}/${videoList.length}): ${video.url}`);

      try {
        const result = await runYtDlpCommand(video.url, outputPath);
        
        if (result.success) {
          video.local_path = outputPath.replace('.%(ext)s', '.mp4'); 
          downloadedList.push(video);
        }
      } catch (e) {
        console.error(`Error fatal en el proceso de descarga para ${video.url}: ${e.message}`);
      }
    }
    
    await fs.writeFile(OUTPUT_LIST_FILE, JSON.stringify(downloadedList, null, 2));

    console.log(`\n✅ ${downloadedList.length} videos descargados con éxito.`);

    return downloadedList;
  }
};

export default VideoDownloader;
