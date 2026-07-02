/**
 * 每日一图 handler（ESA Pages 函数路由）
 * 用法：
 *   GET /api/daily                  -> 今日图像（默认 WebP，不重定向）
 *   GET /api/daily?format=jpeg      -> 压缩 JPEG
 *   GET /api/daily?format=original  -> 原始 JPEG
 *   GET /api/daily?redirect=true   -> 302 重定向到图片
 */
export async function handle(request, env, ctx) {
  const url = new URL(request.url);

  // 参数处理与校验
  const format = url.searchParams.get("format") || "webp";
  const redirect = url.searchParams.get("redirect") === "true";

  const allowedFormats = ["webp", "jpeg", "original"];
  if (!allowedFormats.includes(format)) {
    return new Response("Invalid format parameter", { status: 400 });
  }

  // 根据 format 决定静态资源路径
  let imagePath;
  switch (format) {
    case "jpeg":
      imagePath = "/daily.jpeg";
      break;
    case "original":
      imagePath = "/original.jpeg";
      break;
    default:
      imagePath = "/daily.webp";
  }

  // 基于当前请求拼出图片完整 URL，命中 ESA 边缘缓存
  const imageUrl = new URL(imagePath, request.url);

  if (redirect) {
    return Response.redirect(imageUrl.toString(), 302);
  }

  // 通过 fetch 走 ESA 边缘节点缓存
  const originResponse = await fetch(imageUrl.toString(), {
    headers: request.headers,
  });

  if (!originResponse.ok) {
    return new Response("Origin fetch failed", { status: 502 });
  }

  // 透传原始响应体并附加缓存头
  const response = new Response(originResponse.body, originResponse);
  response.headers.set("bing-cache", "ESA");
  response.headers.set("Cache-Control", "public, max-age=10800");

  return response;
}
