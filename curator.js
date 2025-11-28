// curator.js
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

const DOWNLOADS_DIR = path.join(process.cwd(), 'descargas');
const CURATED_DIR = path.join(process.cwd(), 'curados');
const INPUT_LIST_FILE = path.join(process.cwd(), 'data', 'downloaded_list.json');
const OUTPUT_LIST_FILE = path.join(process.cwd(), 'data', 'curated_list.json');

// --- CONFIGURACIÓN DEL WATERMARK DE TEXTO ---
const WATERMARK_TEXT = '@worldlolvideos'; 
const FONT_SIZE = 70; // Tamaño pequeño (ajustado para resoluciones 1920p)

/**
 * Ejecuta un comando de FFmpeg para añadir la marca de agua de texto.
 */
function runFFmpegCommand(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    
    // NOTA: Eliminamos la entrada -i watermark.png
    const args = [
      '-i', inputPath, // Archivo de entrada de video (índice 0)
      '-filter_complex', 
      // 1. Escala y centra el video [v0] en un lienzo vertical 1080x1920
      // 2. Aplica el filtro drawtext sobre el video escalado [v0]
      '[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1:1[v0];' +
      `[v0]drawtext=text='${WATERMARK_TEXT}':` +
      `x=50:` + // 50px de margen izquierdo
      `y=H-th-50:` + // H (altura total) - th (altura del texto) - 50px de margen inferior
      `fontsize=${FONT_SIZE}:` +
      `fontcolor=white:` + // Color blanco
      `shadowcolor=black:` + // Sombra negra para visibilidad
      `shadowx=2:shadowy=2`,
      
      '-c:v', 'libx264', // Codec de video
      '-crf', '23', // Calidad
      '-preset', 'veryfast', // OPTIMIZACIÓN DE VELOCIDAD
      '-y', // Sobrescribir sin preguntar
      outputPath // Archivo de salida
    ];

    console.log(`\nEjecutando FFmpeg en: ${path.basename(inputPath)}`);

    const child = spawn('ffmpeg', args);
    let errorOutput = '';

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Curado con éxito: ${path.basename(outputPath)}`);
        resolve({ success: true, local_path: outputPath });
      } else {
        console.log(`❌ Error al curar ${path.basename(inputPath)}: Command failed with exit code ${code}.`);
        resolve({ success: false, error: `FFmpeg exit code: ${code}. Output: ${errorOutput.substring(0, 200)}...` });
      }
    });

    child.on('error', (err) => {
      reject(new Error(`Fallo al iniciar el proceso FFmpeg: ${err.message}`));
    });
  });
}

const VideoCurator = {
  // FUNCIÓN 'RUN'
  async run() {
    let videoList;
    try {
        const data = await fs.readFile(INPUT_LIST_FILE, 'utf-8');
        videoList = JSON.parse(data);
    } catch (e) {
        console.log(`No se encontró la lista de videos descargados en ${INPUT_LIST_FILE}.`);
        return [];
    }
    
    if (videoList.length === 0) {
        console.log('No hay videos descargados para curar.');
        return [];
    }

    // ELIMINADO: Ya no se requiere la verificación del archivo watermark.png

    console.log(`Comenzando la curación de ${videoList.length} videos...`);
    
    await fs.mkdir(CURATED_DIR, { recursive: true });

    const curatedList = [];
    
    for (const video of videoList) {
        if (video.local_path) {
            const fileName = path.basename(video.local_path).replace('.mp4', '-curado.mp4'); 
            const outputPath = path.join(CURATED_DIR, fileName);
            
            try {
                const result = await runFFmpegCommand(video.local_path, outputPath);
                
                if (result.success) {
                    video.curated_path = outputPath;
                    curatedList.push(video);
                }
            } catch (e) {
                console.error(`Error fatal en el proceso de curación para ${video.local_path}: ${e.message}`);
            }
        }
    }
    
    await fs.writeFile(OUTPUT_LIST_FILE, JSON.stringify(curatedList, null, 2));

    console.log(`\n✅ ${curatedList.length} videos curados con éxito.`);

    return curatedList;
  }
};

export default VideoCurator;
