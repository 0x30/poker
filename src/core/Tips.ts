import { debugCards } from "./Card";
import {
  getCurrentCardsPool,
  getGameCurrentPlayer,
  getNeedHandleTrick,
} from "./Game";
import { Card, Color, Game } from "./model";
import { detect, duel, Result } from "./Referee";
import { getPermutations, useCache } from "./util";

const rmDup = (cards: Card[][]) => {
  const pools: { [key: string]: Card[] } = {};
  for (const cs of cards) {
    const key = debugCards(cs);
    if (pools[key] === undefined) pools[key] = cs;
  }
  return Object.values(pools);
};

/**
 * 获取推荐的片组集合
 */
const tips = (cards: Card[], cardPools: Card[]) => {
  const targetCardSize: number[] = Array.from(new Set([cards.length, 2, 4]));
  const combs = targetCardSize.flatMap((s) => getPermutations(cardPools, s));
  const result = rmDup(combs).filter(
    (comb) => duel(cards, comb, cardPools.length - comb.length === 0) === true
  );
  const resPools: { [key: string]: 0 } = {};
  return result.filter((r) => {
    const res = r.map((r) => r.number).join("");
    if (resPools[res] === undefined) {
      resPools[res] = 0;
      return true;
    }
    return false;
  });
};

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
    (a, b) => a.type + a.weight - (b.type + b.weight)
  )[0]?.cards;
};
