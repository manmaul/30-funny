import fetch from "node-fetch";

const HASHTAGS = ["funny", "humor", "lol", "memes", "viral", "shorts", "funnyvideos". "lolvideos", "viralvideos", "graciosos"];

const TikTokScraper = {
  /** ---------------------------------------------
   *  TikTok Fallback (sin API oficial)
   *  Si quieres datos reales, te configuro RapidAPI
   * ----------------------------------------------*/
  async scrapeTikTok() {
    try {
      // Aquí podrías integrar RapidAPI para resultados reales:
      // https://rapidapi.com/tiktok/
      return [{
        titulo: "TikTok - datos simulados (scraping bloqueado por TikTok)",
        url: "https://www.tiktok.com/@example/video/123",
        views: 1000000
      }];
    } catch (err) {
      return [{
        titulo: "TikTok (error, usando fallback)",
        url: "https://www.tiktok.com/@fallback/video/000",
        views: 0
      }];
    }
  },

  /** ---------------------------------------------
   *  YouTube Shorts: búsqueda real por API pública
   * ----------------------------------------------*/
  async scrapeYouTube() {
    const results = [];

    try {
      for (const tag of HASHTAGS) {
        const url = `https://yt.lemnoslife.com/noKey/search?search_query=${encodeURIComponent(tag)}+shorts`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data?.items) continue;

        for (const item of data.items) {
          if (!item.id?.videoId) continue;

          results.push({
            titulo: item.title || "Sin título",
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            views: item.viewCount ?? 0
          });
        }
      }

      // Limpiar duplicados
      const unique = [];
      const urls = new Set();

      for (const vid of results) {
        if (!urls.has(vid.url)) {
          urls.add(vid.url);
          unique.push(vid);
        }
      }

      return unique.slice(0, 20); // límite razonable

    } catch (err) {
      console.error("Error YouTube:", err.message);
      return [];
    }
  }
};

export default TikTokScraper;
