// uploader.js
import fs from 'fs/promises';
import path from 'path';

const INPUT_LIST_FILE = path.join(process.cwd(), 'data', 'curated_list.json');

// --- ESPECIFICACIONES DE GOOGLE DRIVE ---
const DRIVE_FOLDER_ID = '1OplRlyy1YxTChJBsYdGWYxemh__3oYE0';
const DRIVE_FOLDER_NAME = 'Publica Hoy';

const VideoUploader = {
    async run() {
        let videoList;
        try {
            const data = await fs.readFile(INPUT_LIST_FILE, 'utf-8');
            videoList = JSON.parse(data);
        } catch (e) {
            console.log(`No se encontró la lista de videos curados en ${INPUT_LIST_FILE}.`);
            return [];
        }

        if (videoList.length === 0) {
            console.log('No hay videos curados para subir.');
            return [];
        }

        console.log(`\nComenzando la simulación de subida a Google Drive de ${videoList.length} videos...`);
        
        // --- LÓGICA DE SUBIDA A GOOGLE DRIVE (SIMULADA) ---
        // ATENCIÓN: Aquí es donde iría la lógica real usando el SDK de Google Drive
        
        const uploadedVideos = videoList.map(video => {
            const fileName = path.basename(video.curated_path);
            
            // Simulación de la subida a la carpeta específica
            console.log(`✅ SIMULADO: Subiendo ${fileName} a la carpeta Drive: "${DRIVE_FOLDER_NAME}" (ID: ${DRIVE_FOLDER_ID})...`);
            
            // Creación de un enlace simulado a la carpeta
            video.drive_link = `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`;
            
            return video;
        });
        
        console.log(`\n✅ ${uploadedVideos.length} videos listos para la publicación semiautomática desde Drive.`);

        return uploadedVideos;
    }
};

export default VideoUploader;
