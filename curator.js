// curator.js
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

const DOWNLOADS_DIR = path.join(process.cwd(), 'descargas');
const CURATED_DIR = path.join(process.cwd(), 'curados');
const INPUT_LIST_FILE = path.join(process.cwd(), 'data', 'downloaded_list.json');
const OUTPUT_LIST_FILE = path.join(process.cwd(), 'data', 'curated_list.json');

// --- CONFIGURACIÓN DEL WATERMARK ---
const WATERMARK_TEXT = 'ANDRE.AI';

// RUTA ABSOLUTA DE LA FUENTE EN WINDOWS (DEBES VERIFICAR QUE ESTA RUTA ES CORRECTA)
// Usamos barras normales (/) en la ruta de FFmpeg, lo cual es la mejor práctica.
const ARIA_FONT_PATH = 'C:/Windows/Fonts/arial.ttf'; 

/**
 * Ejecuta un comando de FFmpeg para añadir la marca de agua y recortar el video.
 */
function runFFmpegCommand(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    
    // Comando para añadir texto y recortar el video a 10 segundos
    const args = [
      '-i', inputPath, // Archivo de entrada
      '-t', '00:00:10', // Duración máxima de 10 segundos
      '-vf', 
      // FILTRO CORREGIDO: Usamos la ruta absoluta de la fuente para evitar el error Fontconfig
      `drawtext=text='${WATERMARK_TEXT}':fontcolor=white@0.8:fontsize=30:x=(w-text_w)/2:y=h-(2*text_h):fontfile='${ARIA_FONT_PATH}'`, 
      '-c:v', 'libx264', // Codec de video
      '-crf', '23', // Calidad
      '-preset', 'fast', // Velocidad de codificación
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
        console.log(`❌ Error al curar ${path.basename(inputPath)}: Command failed with exit code ${code}`);
        resolve({ success: false, error: `FFmpeg exit code: ${code}` });
      }
    });

    child.on('error', (err) => {
      // Error de ejecución del comando (ej: ffmpeg no se encontró en el PATH)
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

    console.log(`Comenzando la curación de ${videoList.length} videos...`);
    
    // Asegurar que la carpeta 'curados' existe
    await fs.mkdir(CURATED_DIR, { recursive: true });

    const curatedList = [];

    for (const video of videoList) {
        if (video.local_path) {
            // Renombrar el archivo de salida para la curación
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
    
    // Guardar la lista de videos curados para la FASE 4
    await fs.writeFile(OUTPUT_LIST_FILE, JSON.stringify(curatedList, null, 2));

    console.log(`\n✅ ${curatedList.length} videos curados con éxito.`);

    return curatedList;
  }
};

export default VideoCurator;
