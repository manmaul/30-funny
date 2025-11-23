import { chromium } from "playwright";

/**
 * Scrapea TikTok para obtener hasta 30 videos de un hashtag dado.
 * Manejo de errores, duplicados, scroll dinámico y logs.
 */
export async function getTikTokTop30(hashtag = "funny") {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const url = `https://www.tiktok.com/tag/${encodeURIComponent(hashtag)}`;
    console.log("🔎 Navegando a:", url);

    await page.goto(url, { waitUntil: "networkidle" });

    // Espera dinámica a que los videos carguen
    await page.waitForSelector("a[href*='/video/']", { timeout: 10000 });

    // Scroll para cargar más videos
    let previousHeight = 0;
    for (let i = 0; i < 5; i++) {
      const bodyHandle = await page.$("body");
      const boundingBox = await bodyHandle.boundingBox();
      if (!boundingBox || boundingBox.height === previousHeight) break;
      previousHeight = boundingBox.height;

      await page.mouse.wheel(0, 5000);
      await page.waitForTimeout(1000);
    }

    const videos = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll("a[href*='/video/']"));
      // eliminar duplicados
      const urls = [...new Set(items.map(a => a.href))];
      return urls.slice(0, 30).map(url => ({ url }));
    });

    console.log(`✅ TikTok: encontrados ${videos.length} videos`);
    return videos;

  } catch (err) {
    console.error("❌ Error en TikTok scraper:", err);
    return [];
  } finally {
    if (browser) await browser.close();
  }
}

  await browser.close();
  return videos;
}

