import { DecodeCard, EncodeCard } from "./Card";
import { getGameCurrentPlayer, getNeedHandleTrick } from "./Game";
import { Game, GamePlayer, isRobot, isWoodMan, Player, Trick } from "./model";
import { gameTip } from "./Tips";

const url = (player: Player, path: string) => {
  return `http://${player.host}${path}`;
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

/**
 * 发牌
 */
export const deal = (game: Game) => Promise.resolve();
export const broadcast = (game: Game, trick: Trick) => Promise.resolve();

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
      game.__isOnline === true
        ? []
        : gameTip(game)?.map((c) => EncodeCard(c)),
    needHandleTrick: needTrick(),
  })
    .then((res) => res.json())
    .then((res) => {
      let cards = undefined;
      if (res.data?.length > 0) {
        cards = res.data?.map(DecodeCard);
      }
      return new Trick(player, cards);
    });
};
