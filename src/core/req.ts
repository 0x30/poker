import { DecodeCard, EncodeCard } from "./Card";
import { getGameCurrentPlayer, getNeedHandleTrick } from "./Game";
import { Game, GamePlayer, isRobot, isWoodMan, Player, Trick } from "./model";
import { gameTip } from "./Tips";

import MyWorker from "./reqWorker?worker";
import { generateId } from "./util";
import { sample } from "lodash";

const workers = [
  new MyWorker(),
  new MyWorker(),
  new MyWorker(),
  new MyWorker(),
];

const url = (player: Player, path: string) => {
  return `http://${player.host}${path}`;
};

const fetch = (url: string, params: any) => {
  const worker = sample(workers);
  return new Promise<any>((resolve) => {
    const id = generateId();
    const handler = (event: any) => {
      if (event.data.id !== id) return;
      worker?.removeEventListener("message", handler);
      resolve(event.data.res);
    };
    worker?.addEventListener("message", handler);
    worker?.postMessage({ id, url, params });
  });
};

const cfetch = (player: GamePlayer, path: string, body: any) => {
  const params =
    body === undefined
      ? undefined
      : {
          body: JSON.stringify({
            ...body,
            ...{
              player: {
                ...player,
                ...{ cards: player.cards.map(EncodeCard) },
              },
            },
          }),
          headers: { "content-type": "application/json" },
          method: "POST",
        };
  return fetch(url(player, path), { ...params, ...{ mode: "cors" } });
};

export const askTrick = (game: Game) => {
  const player = getGameCurrentPlayer(game);
  if (isWoodMan(player)) return Promise.resolve(new Trick(player, undefined));
  if (isRobot(player)) return Promise.resolve(new Trick(player, gameTip(game)));

  const history = () => {
    const result = game.tricks
      .sort((a, b) => a.idx - b.idx)
      .flatMap((ts) => ts.tricks.sort((a, b) => a.createTime - b.createTime));
    return result.map((t) => ({
      ...t,
      ...{ player: { ...t.player, ...{ leftCards: undefined } } },
      ...{ cards: t.cards?.map(EncodeCard) },
    }));
  };

  const needTrick = () => {
    const trick = getNeedHandleTrick(game);
    return {
      ...trick,
      ...{ cards: trick?.cards?.map(EncodeCard) },
    };
  };

  return cfetch(player, "/ask", {
    gameId: game.id,
    history: history(),
    tips:
      game.__isOnline === true ? [] : gameTip(game)?.map((c) => EncodeCard(c)),
    needHandleTrick: needTrick(),
  }).then((res) => {
    let cards = undefined;
    if (res.data?.length > 0) {
      cards = res.data?.map(DecodeCard);
    }
    return new Trick(player, cards);
  });
};
