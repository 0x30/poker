import { getGameCurrentPlayer, getNeedHandleTrick } from "./Game";
import { Game, isNpc, isRobot, isWoodMan, Player, Trick } from "./model";
import { gameTip } from "./Tips";

const url = (player: Player, path: string) => {
  return `http://${player.host}${path}`;
};

const cfetch = (player: Player, path: string, body: any) => {
  const params =
    body === undefined
      ? undefined
      : {
          body: JSON.stringify({ ...body, ...{ userId: player.id } }),
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
  const res = await Promise.all(
    game.players.filter((p) => isNpc(p) === false).map(req)
  );
  return res.every((v) => v);
};

/**
 * 发牌
 */
export const deal = (game: Game) => {
  return Promise.all(
    game.players
      .filter((p) => isNpc(p) === false)
      .map((p) => cfetch(p, "/deal", { gameId: game.id, cards: p.cards }))
  );
};

export const askTrick = (game: Game) => {
  const player = getGameCurrentPlayer(game);
  if (isWoodMan(player)) return Promise.resolve(new Trick(player, undefined));
  if (isRobot(player)) return Promise.resolve(new Trick(player, gameTip(game)));
  return cfetch(player, "/ask", {
    gameId: game.id,
    trciks: game.tricks,
    tips: gameTip(game),
    needHandleTrick: getNeedHandleTrick(game),
  }).then((res) => new Trick(player, res.data));
};

export const broadcast = (game: Game, trick: Trick) => {
  return Promise.all(
    game.players
      .filter((p) => isNpc(p) === false)
      .map((p) =>
        cfetch(p, "/broadcast", {
          gameId: game.id,
          trick,
        })
      )
  );
};
