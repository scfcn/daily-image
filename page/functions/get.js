/**
 * 随机图重定向（ESA Pages 函数模板）
 * 访问 /get 即随机跳转到一张历史壁纸。
 * 缓存图片数据 12 小时，减少重复请求。
 */
let cachedPictures = null;
let cacheTimestamp = 0;
const CACHE_TTL = 43200000; // 12 小时

export default {
  async fetch(request, env, ctx) {
    try {
      const now = Date.now();
      if (!cachedPictures || now - cacheTimestamp > CACHE_TTL) {
        const jsonUrl = new URL("/picture/index.json", request.url).toString();
        const response = await fetch(jsonUrl, { headers: request.headers });

        if (!response.ok) {
          return new Response("Index not found", { status: 404 });
        }

        cachedPictures = await response.json();
        cacheTimestamp = now;
      }

      if (!Array.isArray(cachedPictures) || cachedPictures.length === 0) {
        return new Response("No images available", { status: 404 });
      }

      // 随机选择一张图片
      const randomIndex = Math.floor(cachedPictures.length * Math.random());
      const path = cachedPictures[randomIndex].path;

      return new Response(null, {
        status: 302,
        headers: {
          Location: path,
          "Cache-Control": "no-store",
        },
      });
    } catch (error) {
      return new Response("Error", { status: 500 });
    }
  },
};
