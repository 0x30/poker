import { Application, Router } from "https://deno.land/x/oak@v7.5.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

import type { AskRequest, Card, Trick } from "./model.ts";

const router = new Router();

const fc: Card = { color: "方片", number: "3" };

/// 当前卡组是否包含提供的卡片
const noSi = (cs: Card[], card: Card) => {
  return (
    cs.find((c) => c.number === card.number && c.color === card.color) ===
    undefined
  );
};

router.post("/ask", async (ctx) => {
  const ask = (await ctx.request.body({ type: "json" }).value) as AskRequest;

  const askReq = (ask: AskRequest) => {
    /// 首轮出牌
    if (JSON.stringify(ask.needHandleTrick) === "{}") {
      if (ask.history.length === 0) return { data: [fc] };

      const cardGraveyard = ask.history
        .filter((t) => t.player.id === ask.player.id)
        .flatMap((c) => c.cards);

      const firstCard = ask.player.cards.filter((c) =>
        noSi(cardGraveyard, c)
      )[0];

      if (firstCard === undefined) return {};
      return {
        data: [firstCard],
      };
    }

    return {};
  };

  ctx.response.body = askReq(ask);
});

await new Application()
  .use(oakCors({ origin: "http://localhost:3000" }))
  .use(router.routes())
  .listen({ port: 8000 });
