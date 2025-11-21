# 30-funny

Servidor que descarga 25 TikTok + 5 YouTube Shorts diarios y los sube a Google Drive en la carpeta **Publica Hoy**.
Usado en conjunto con tu Apps Script para publicar a las 18:00 CET.

## Requisitos
- Node 18+
- yt-dlp instalado en el host (o build step que lo instale)
- Google Service Account `credentials.json` con Drive API enabled
- PEXELS_API_KEY (opcional fallback)
- Render account recomendado

## Estructura
- index.js : proceso principal y cron
- src/gatherVideos.js : encuentra URLs (scraper + placeholders)
- src/googleDrive.js : sube archivos a Google Drive
- web/* : páginas estáticas (info / redirect)

## Deploy (resumen)
1. Subir repo a GitHub (30-funny).
2. En Render: New Web Service → conectar repo.
   - Build command: `npm install && pip3 install yt-dlp` (si usas python package)
   - Start command: `node index.js`
3. Añadir secret `credentials.json` (o subir archivo en Files & Secrets)
4. Set env vars en Render:
   - `RUN_NOW=1` (solo para probar)
   - `PEXELS_API_KEY` (opcional)
5. Ejecutar `RUN_NOW=1 node index.js` para probar manualmente.

## Nota legal
Has elegido la opción de scraping/descarga de contenido no guardado por ti: existe riesgo de infracción de TOS. Úsalo bajo tu responsabilidad.
