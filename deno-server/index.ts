import { Application, Router } from "https://deno.land/x/oak@v7.5.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

import type { DealRequest, AskRequest, BroadcastRequest } from "./model.ts";

const router = new Router();

router.post("/deal", async (ctx) => {
  (await ctx.request.body({ type: "json" }).value) as DealRequest;
  // 随便返回 不会处理
  ctx.response.body = {};
});

router.post("/ask", async (ctx) => {
  const ask = (await ctx.request.body({ type: "json" }).value) as AskRequest;
  ctx.response.body = { data: ask.tips };
});

router.post("/broadcast", async (ctx) => {
  const broadcast = (await ctx.request.body({ type: "json" })
    .value) as BroadcastRequest;
  // 随便返回 不会处理
  ctx.response.body = {};
});

await new Application()
  .use(oakCors({ origin: "http://localhost:3000" }))
  .use(router.routes())
  .listen({ port: 8000 });
