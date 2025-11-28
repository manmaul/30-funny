// scraper.js (dentro de async scrapeTikTok())

// ...
        const randomHashtag = HASHTAGS[Math.floor(Math.random() * HASHTAGS.length)];
        const url = `https://www.tiktok.com/tag/${randomHashtag}`;

        // ... (código para lanzar puppeteer)
        
        // Esperar el selector de videos
        await page.waitForSelector('div[data-e2e="challenge-item"]', { timeout: 45000 });

        // MODIFICACIÓN CLAVE: Pasamos randomHashtag como un tercer argumento.
        const videos = await page.evaluate((count, hashtag) => { 
            const results = [];
            const videoElements = document.querySelectorAll('div[data-e2e="challenge-item"]');
            
            // Buscamos más del necesario para tener margen
            for (let i = 0; i < Math.min(count * 2, videoElements.length); i++) {
                const element = videoElements[i];
                const link = element.querySelector('a')?.href;
                
                if (link) {
                    const videoId = link.split('/video/')[1]?.split('?')[0] || `tiktok-real-${i}`;
                    
                    results.push({
                        id: videoId,
                        url: link, 
                        platform: 'TikTok',
                        title: `TikTok #${videoId} (${hashtag})`, // <-- USAMOS 'hashtag' AQUÍ
                        virality_score: i 
                    });
                }
            }
            return results;
        }, TIKTOK_COUNT, randomHashtag); // <-- PASAMOS TIKTOK_COUNT y randomHashtag
// ...
