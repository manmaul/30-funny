import fs from 'fs/promises';
import { spawn } from 'child_process';
import path from 'path';

// ... el resto del código del downloader.js sigue aquí ...
import { spawn } from 'child_process';
import path from 'path';

const DOWNLOADS_DIR = path.join(process.cwd(), 'descargas');
const OUTPUT_FILE = path.join(process.cwd(), 'data', 'downloaded_list.json');

// Función para ejecutar el comando yt-dlp
function runCommand(url, outputPath) {
  return new Promise((resolve, reject) => {
    const command = 'yt-dlp';
    
    // Argumentos corregidos para incluir la solución al warning de JavaScript Runtime
    const args = [
      '-o', outputPath,
      '--restrict-filenames',
      '-S', 'ext:mp4:m4a,height:1080',
      '--extractor-args', 'youtube:player_client=default', // Solución al problema de JS
      url
    ];

    console.log(`Ejecutando: ${command} ${args.join(' ')}`);

    const child = spawn(command, args);

    let errorOutput = '';

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        // La descarga fue exitosa
        console.log(`✅ Descargado con éxito: ${url}`);
        // Nota: yt-dlp usa el template, no el nombre exacto, pero para el proceso es suficiente
        resolve({ url, success: true, local_path: outputPath.replace('.%(ext)s', '.mp4') }); 
      } else {
        // La descarga falló
        console.log(`❌ Error al descargar ${url}: ${errorOutput}`);
        resolve({ url, success: false, error: errorOutput });
      }
    });
    
    child.on('error', (err) => {
      // Error de ejecución del comando (ej: yt-dlp no se encontró)
      reject(new Error(`Fallo al iniciar el proceso: ${err.message}`));
    });
  });
}

const VideoDownloader = {
  // FUNCIÓN 'RUN'
  async run(videoList) {
    console.log(`Comenzando la descarga de ${videoList.length} videos...`);
    
    // Asegurar que la carpeta 'descargas' existe
    await fs.promises.mkdir(DOWNLOADS_DIR, { recursive: true });

    const downloadedVideos = [];
    const successList = [];

    for (let i = 0; i < videoList.length; i++) {
      const video = videoList[i];
      const filenamePrefix = video.plataforma === 'tiktok' ? 'tiktok' : 'instagram';
      
      // La ruta de salida usa el template '%(ext)s' para que yt-dlp escoja la extensión
      const outputPath = path.join(DOWNLOADS_DIR, `${filenamePrefix}-${i}.%(ext)s`); 

      console.log(`Descargando (${i + 1}/${videoList.length}): ${video.url}`);

      try {
        const result = await runCommand(video.url, outputPath);
        
        // Si la descarga fue exitosa, agregamos la información al objeto de la lista original
        if (result.success) {
            video.local_path = result.local_path;
            successList.push(video);
        }

      } catch (e) {
        console.error(`Error de ejecución fatal para ${video.url}: ${e.message}`);
      }
    }
    
    // Guardar la lista de videos descargados con éxito para la FASE 3
    await fs.promises.writeFile(OUTPUT_FILE, JSON.stringify(successList, null, 2));

    console.log(`✅ ${successList.length} videos descargados con éxito.`);

    return successList;
  }
};

export default VideoDownloader;
