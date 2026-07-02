/**
 * ESA Pages「函数和 Pages」单一入口
 * 文档：https://help.aliyun.com/zh/edge-security-acceleration/esa/user-guide/what-is-functions-and-pages
 *
 * 路由表：
 *   GET /api          -> API 文档页
 *   GET /api/daily    -> 每日一图
 *   GET /api/random   -> 随机图
 *
 * 注意：本入口仅处理动态 API 路由；HTML / 静态图片等由 assets 直接托管。
 */
import { handle as handleIndex } from "./api/index.js";
import { handle as handleDaily } from "./api/daily.js";
import { handle as handleRandom } from "./api/random.js";

const ROUTES = [
  { method: "GET", pattern: /^\/api\/?$/, handler: handleIndex },
  { method: "GET", pattern: /^\/api\/daily\/?$/, handler: handleDaily },
  { method: "GET", pattern: /^\/api\/random\/?$/, handler: handleRandom },
];

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();

    for (const route of ROUTES) {
      if (route.method === method && route.pattern.test(path)) {
        try {
          return await route.handler(request, env, ctx);
        } catch (err) {
          console.error(`[route ${method} ${path}]`, err);
          return jsonResponse({ error: "Internal Server Error", message: String(err) }, 500);
        }
      }
    }

    // 未匹配到任何动态路由时，交给静态资源（assets）兜底
    // 根据 esa.jsonc 的 notFoundStrategy，会由平台返回 404.html
    return new Response("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
};
