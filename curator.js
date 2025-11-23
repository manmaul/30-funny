import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';

const CURATED_DIR = path.join(process.cwd(), 'curados');

/**
 * Procesa un solo video con FFmpeg, añadiendo un watermark de crédito.
 * @param {Object} video El objeto de metadatos del video.
 * @returns {Promise<string>} La ruta al archivo curado.
 */
function transformarVideo(video) {
  const inputPath = video.download_path;
  const outputFilename = `curado-${path.basename(inputPath)}`;
  const outputPath = path.join(CURATED_DIR, outputFilename);
  
  // 1. Texto de Crédito Mínimo
  const credito = `Original: ${video.autor_handle}`;
  
  // 2. Filtros de FFmpeg para la Transformación
  
  // Añade una banda negra de 100px en la parte inferior (pad)
  // luego superpone el texto de crédito (drawtext)
  const filters = [
    // Escala a 1080px de ancho y añade un relleno (pad) negro de 100px abajo
    'scale=1080:-1,pad=1080:ih+100:0:0:black', 
    // Dibuja el texto centrado en ese relleno
    `drawtext=text='${credito}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=H-60` 
  ].join(',');

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        `-vf ${filters}`, // Aplica los filtros de video
        '-c:a copy', // Copia el audio sin recodificar (más rápido)
        '-y' // Sobrescribe si el archivo ya existe
      ])
      .save(outputPath)
      .on('end', () => {
        console.log(`\t✅ Curado: ${outputPath}`);
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error(`\t❌ Error FFmpeg para ${video.autor_handle}: ${err.message}`);
        reject(err);
      });
  });
}

const Curator = {
  /**
   * Ejecuta la transformación para todos los videos en la lista.
   * @param {Array<Object>} videoList Lista de videos con la ruta de descarga.
   * @returns {Array<Object>} Lista de videos con la ruta curada añadida.
   */
  async run(videoList) {
    if (!videoList || videoList.length === 0) {
      console.log("No hay videos descargados para curar.");
      return [];
    }
    
    // Asegurar la carpeta de salida
    await fs.mkdir(CURATED_DIR, { recursive: true });

    console.log(`\nComenzando la curación de ${videoList.length} videos (FFmpeg)...`);
    
    const curatedVideos = [];

    for (const video of videoList) {
        try {
            const curatedPath = await transformarVideo(video);
            curatedVideos.push({
                ...video,
                curated_path: curatedPath // Añade la nueva ruta al objeto
            });
        } catch (error) {
            // El video fallido se omite, pero el flujo principal continúa
        }
    }

    console.log(`✅ Curación completada. ${curatedVideos.length} videos listos.`);
    return curatedVideos;
  }
};

export default Curator;
