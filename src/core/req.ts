import { debugCards } from "./Card";
import {
  Card,
  currentPlayer,
  Game,
  getNeedHandleTrick,
  Player,
  Trick,
} from "./model";
import { gameTip } from "./Tips";

const TEST = true;

const url = (player: Player, path: string) => {
  return `http://${player.host}${path}`;
};

const timer = (time: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

const jsFaker = async (path: string, params: any) => {
  // await timer(2000);
  if (path === "/ask") {
    return {
      data: params.tips,
    };
  }

  if (path === "/ready") {
    return {
      data: true,
    };
  }
};

const cfetch = (player: Player, path: string, body: any) => {
  if (TEST) {
    return jsFaker(path, body);
  }
  const params =
    body === undefined
      ? undefined
      : {
          body: JSON.stringify(body),
          headers: { "content-type": "application/json" },
          method: "POST",
        };
  return fetch(url(player, path), { ...params }).then((res) => res.json());
};

/**
 * 是否准备好
 */
export const ready = async (game: Game) => {
  const req = (p: Player) => {
    return new Promise<boolean>((resolve) => {
      cfetch(p, "/ready", undefined)
        .then((res) => resolve(res.data))
        .catch(() => resolve(false));
    });
  };
  const res = await Promise.all(game.players.map(req));
  return res.every((v) => v);
};

/**
 * 发牌
 */
export const deal = (game: Game) => {
  return Promise.all(
    game.players.map((p) =>
      cfetch(p, "/deal", { gameId: game.id, cards: p.cards })
    )
  );
};

export const askTrick = (game: Game) => {
  const player = currentPlayer(game);
  return cfetch(player, "/ask", {
    gameId: game.id,
    trciks: game.tricks,
    tips: gameTip(game),
    needHandleTrick: getNeedHandleTrick(game),
  }).then((res) => new Trick({ ...player, ...{ cards: undefined } }, res.data));
};

export const broadcast = (game: Game, trick: Trick) => {
  return Promise.all(
    game.players
      // .filter((p) => p.id !== trick.player.id)
      .map((p) =>
        fetch(url(p, "/broadcast"), {
          body: JSON.stringify({
            gameId: game.id,
            trick,
          }),
          headers: {
            "content-type": "application/json",
          },
          method: "POST",
        })
      )
  );
};
