import fs from "fs";
import path from "path";
import { google } from "googleapis";

const CREDENTIALS_PATH = "./credentials.json";

// Scope completo para subir + compartir archivos
const SCOPES = ["https://www.googleapis.com/auth/drive"];

export async function authDrive() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: SCOPES
  });
  const client = await auth.getClient();
  return google.drive({ version: "v3", auth: client });
}

/* ------------------------------------------------------
   Encuentra o crea una carpeta de forma segura
-------------------------------------------------------- */
export async function ensureFolderExists(drive, name) {
  const res = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`,
    fields: "files(id,name)"
  });

  if (res.data.files?.length > 0) {
    return res.data.files[0].id;
  }

  // Crear carpeta
  const folder = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder"
    },
    fields: "id"
  });

  return folder.data.id;
}

/* ------------------------------------------------------
   Permite acceso público
-------------------------------------------------------- */
async function makeFilePublic(drive, fileId) {
  try {
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone"
      }
    });
  } catch (e) {
    console.warn("⚠️ No se pudo hacer público el archivo:", e.message);
  }
}

/* ------------------------------------------------------
   Subida de archivos robusta con retry
-------------------------------------------------------- */
export async function uploadFileToDrive(drive, folderId, localPath, retries = 3) {
  const fileName = path.basename(localPath);
  const fileSize = fs.statSync(localPath).size;

  const upload = async (attempt = 1) => {
    try {
      console.log(`⬆️ Subiendo (${attempt}/${retries}) →`, fileName);

      const res = await drive.files.create({
        requestBody: {
          name: fileName,
