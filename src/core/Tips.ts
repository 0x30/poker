import { jokers } from "./Card";
import {
  getCurrentCardsPool,
  getGameCurrentPlayer,
  getNeedHandleTrick,
} from "./Game";
import { Card, Color, Game } from "./model";
import { CardsType, detect, monotone, Result } from "./Referee";
import { useCache } from "./util";


const _gameTips = (game: Game): (Result & { cards: Card[] })[] => {
  const exec = () => {
    const needHandleTrick = getNeedHandleTrick(game);
    if (needHandleTrick === undefined) {
      if (game.tricks.length === 0)
        return [[{ color: Color.Diamond, number: 3 }]];
    }
    const cp = getGameCurrentPlayer(game);
    const currentCardPools = getCurrentCardsPool(game, cp);
    if (needHandleTrick === undefined)
      return [currentCardPools.sort((a, b) => a.number - b.number).slice(0, 1)];
    return tips(needHandleTrick.cards!, currentCardPools);
  };
  return exec().map((cs) => ({ ...detect(cs)!, ...{ cards: cs } }));
};

const gameTipCache = useCache<(Result & { cards: Card[] })[]>();
export const gameTips = (game: Game) => {
  const gid = game.id,
    tricks = game.tricks.length,
    trickss = game.tricks.reduce((t, c) => t + c.tricks.length, 0);
  const id = `${gid}${tricks}${trickss}`;
  return gameTipCache(id, () => _gameTips(game));
};

export const gameTip = (game: Game): Card[] | undefined => {
  return gameTips(game).sort(
    (a, b) => a.type * 10 + a.weight - (b.type * 10 + b.weight)
  )[0]?.cards;
};
