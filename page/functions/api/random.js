/**
 * 随机图 API（ESA Pages 函数模板）
 * 用法：
 *   /api/random                  -> 随机图片（默认不重定向，直接返回图片）
 *   /api/random?redirect=true    -> 302 重定向到图片
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 从当前请求的域名拼接 JSON 地址
    const jsonUrl = new URL("/picture/index.json", request.url).toString();

    // 通过 fetch 读取索引（走 ESA 边缘缓存）
    const fetchResp = await fetch(jsonUrl, { headers: request.headers });
    if (!fetchResp.ok) {
      return new Response("Failed to load index.json", { status: 502 });
    }

    let images = await fetchResp.json();

    // 去掉最后一张，防止过期
    if (images.length > 1) {
      images = images.slice(0, -1);
    }

    if (images.length === 0) {
      return new Response("No images available", { status: 404 });
    }

    // 随机挑一张
    const randomImage = images[Math.floor(Math.random() * images.length)];
    const redirect = url.searchParams.get("redirect") === "true";

    const imagePath = randomImage.path; // e.g. /picture/2025-08-24.webp
    const imageUrl = new URL(imagePath, request.url).toString();

    if (redirect) {
      return Response.redirect(imagePath, 302);
    }

    // 直接返回图片二进制，走 ESA 节点缓存
    const resp = await fetch(imageUrl, { headers: request.headers });
    if (!resp.ok) {
      return new Response("Failed to fetch image", { status: 502 });
    }

    return new Response(resp.body, {
      headers: {
        "Content-Type": resp.headers.get("Content-Type") || "image/webp",
        "Cache-Control": "public, max-age=10800",
        "bing-cache": "ESA-FETCH",
      },
    });
  },
};
