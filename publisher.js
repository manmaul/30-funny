import path from 'path';

/**
 * Función para generar la descripción/créditos mínima requerida.
 * @param {Object} video Metadatos del video.
 * @returns {string} El texto de la descripción.
 */
function generarDescripcion(video) {
  // Crédito MÍNIMO en la descripción (obligatorio para transparencia)
  const creditLine = `🎥 Créditos: ${video.autor_handle}.`;
  
  // URL para dirigir tráfico al original (opcional pero recomendado)
  const urlLine = `\n\n🔗 Original aquí: ${video.url}`;
  
  // Hashtags (los originales del scraping + tus propios hashtags de curación)
  const hashtags = "\n\n#reels #shorts #tiktokviral #humor"; 
  
  return `${video.titulo}\n\n${creditLine}${urlLine}${hashtags}`;
}

const Publisher = {

  /**
   * Simula la subida a una plataforma.
   * La lógica REAL requiere SDKs de Google/Meta o librerías de terceros.
   * @param {string} platform Nombre de la plataforma.
   * @param {Object} video Metadatos del video curado.
   */
  async _uploadVideo(platform, video) {
    const description = generarDescripcion(video);
    
    console.log(`\tPublicando en ${platform}...`);
    console.log(`\tArchivo: ${path.basename(video.curated_path)}`);
    console.log(`\tTítulo: ${video.titulo}`);
    // console.log(`\tDescripción: ${description}`); // Descomentar para ver la descripción

    // Aquí iría la lógica de la API real. Por ejemplo:
    // if (platform === 'youtube') {
    //   await youtube.videos.insert({ ... parámetros de subida y descripción });
    // }
    
    // Simulación de una pausa para simular el tiempo de subida
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    console.log(`\t✅ Publicado en ${platform}.`);
  },

  /**
   * Orquesta la subida a las tres redes.
   * @param {Array<Object>} videoList Lista de videos curados.
   */
  async run(videoList) {
    if (!videoList || videoList.length === 0) {
      console.log("No hay videos curados para publicar.");
      return;
    }

    console.log(`\nComenzando la publicación de ${videoList.length} videos en las 3 plataformas...`);

    for (const video of videoList) {
        console.log(`\n--- Publicando video: ${video.titulo} ---`);
        
        // Subida 1: YouTube Shorts (Usaremos la URL del TikTok/Reel como fuente)
        await this._uploadVideo('YouTube Shorts', video);

        // Subida 2: Instagram Reels
        await this._uploadVideo('Instagram Reels', video);
        
        // Subida 3: TikTok
        await this._uploadVideo('TikTok', video);
    }
    
    console.log(`\n✅ Publicación completada (Simulación).`);
  }
};

export default Publisher;
