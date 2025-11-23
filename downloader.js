import { execa } from 'execa'; // Necesitas instalar esta librería para ejecutar comandos de sistema
import path from 'path';
import fs from 'fs/promises';

const DOWNLOAD_DIR = path.join(process.cwd(), 'descargas');

const Downloader = {
  /**
   * Descarga una lista de videos usando yt-dlp.
   * @param {Array<Object>} videoList Lista de metadatos de videos.
   * @returns {Array<Object>} Lista de videos con la ruta local añadida.
   */
  async run(videoList) {
    if (!videoList || videoList.length === 0) {
      console.log("No hay videos para descargar.");
      return [];
    }

    // 1. Asegurar la carpeta de descargas
    await fs.mkdir(DOWNLOAD_DIR, { recursive: true });

    const downloadedVideos = [];
    
    console.log(`Comenzando la descarga de ${videoList.length} videos...`);

    for (const [index, video] of videoList.entries()) {
      const outputFilename = `${video.plataforma}-${index}.%(ext)s`;
      const fullOutputPath = path.join(DOWNLOAD_DIR, outputFilename);
      
      console.log(`Descargando (${index + 1}/${videoList.length}): ${video.url}`);

      try {
        // Ejecuta yt-dlp para descargar el video
        // El formato de salida garantiza que obtengamos una extensión
        const { stdout } = await execa('yt-dlp', [
            '-o', fullOutputPath,
            '--restrict-filenames', // Simplifica el nombre de archivo
            '-S', 'ext:mp4:m4a,height:1080', // Prioriza formatos de alta calidad
            video.url
        ]);

        // Encuentra el nombre de archivo real creado por yt-dlp (es un poco complejo sin una API)
        // Buscamos la línea de '[download] Destination: ...'
        const destinationLine = stdout.split('\n').find(line => line.includes('[download] Destination:'));
        const downloadedPath = destinationLine ? destinationLine.split(': ')[1] : fullOutputPath.replace('.%(ext)s', '.mp4');

        // Añadir la ruta al objeto de metadatos
        downloadedVideos.push({
            ...video,
            download_path: downloadedPath
        });

      } catch (error) {
        console.error(`❌ Error al descargar ${video.url}: ${error.message}`);
      }
    }

    console.log(`✅ ${downloadedVideos.length} videos descargados con éxito.`);
    return downloadedVideos;
  }
};

export default Downloader;
