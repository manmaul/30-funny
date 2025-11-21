import fs from "fs";
import { google } from "googleapis";

const CREDENTIALS_PATH = "./credentials.json";
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

export async function authDrive() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: SCOPES
  });
  const client = await auth.getClient();
  return google.drive({ version: "v3", auth: client });
}

export async function ensureFolderExists(drive, name) {
  const res = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false`,
    fields: "files(id,name)"
  });
  if (res.data.files && res.data.files.length > 0) return res.data.files[0].id;

  const folder = await drive.files.create({
    requestBody: { name, mimeType: "application/vnd.google-apps.folder" },
    fields: "id"
  });
  return folder.data.id;
}

export async function uploadFileToDrive(drive, folderId, localPath) {
  const fileName = localPath.split("/").pop();
  const res = await drive.files.create({
    requestBody: { name: fileName, parents: [folderId] },
    media: { mimeType: "video/mp4", body: fs.createReadStream(localPath) },
    fields: "id"
  });
  return res.data.id;
}
