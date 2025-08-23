// 缓存图片数据，减少重复请求
let cachedPictures = null;
let cacheTimestamp = 0;
const CACHE_TTL = 43200000; // 缓存12小时（12×60×60×1000毫秒）

export async function onRequest(context) {
  const { request } = context;
  
  try {
    // 使用缓存数据（如果有效）
    const now = Date.now();
    if (!cachedPictures || now - cacheTimestamp > CACHE_TTL) {
      // 只在缓存过期时才重新请求
      const origin = new URL(request.url).origin;
      const response = await fetch(`${origin}/picture/index.json`);
      
      if (!response.ok) {
        return new Response('Index not found', { status: 404 });
      }
      
      // 直接解析并缓存
      cachedPictures = await response.json();
      cacheTimestamp = now;
    }
    
    // 随机选择一张图片
    const randomIndex = Math.floor(cachedPictures.length * Math.random());
    const path = cachedPictures[randomIndex].path;
    
    // 返回重定向响应
    return new Response(null, {
      status: 302,
      headers: {
        Location: path,
        'Cache-Control': 'no-store' // 确保每次请求都重新随机
      }
    });
  } catch (error) {
    return new Response('Error', { status: 500 });
  }
}
