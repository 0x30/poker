import { debugCards } from "./Card";
import { getCurrentCardsPool, getGameCurrentPlayer, getNeedHandleTrick } from "./Game";
import { Card, Color, Game } from "./model";
import { duel, duelNumbers } from "./Referee";
import { getPermutations } from "./util";

const rmDup = (cards: Card[][]) => {
  const pools: { [key: string]: 0 } = {};
  const a: Card[][] = [];

  for (const cs of cards) {
    const key = cs
      .sort((a, b) => a.number - b.number)
      .map((r) => `${r.number}${r.color}`)
      .join("");
    if (pools[key] === undefined) {
      pools[key] = 0;
      a.push(cs);
    }
  }
  return a;
};

const rmDupNums = (cards: number[][]) => {
  const pools: { [key: string]: 0 } = {};
  const a: number[][] = [];

  for (const cs of cards) {
    const key = cs.sort((a, b) => a - b).join("");
    if (pools[key] === undefined) {
      pools[key] = 0;
      a.push(cs);
    }
  }
  return a;
};

/**
 * 获取推荐的片
 * @param cards 当前的牌
 * @param cardPools 牌池
 * @param justNeedOne 是否只需要一个建议
 * @returns
 */
export const tips = (
  cards: Card[],
  cardPools: Card[],
  justNeedOne: boolean = true
) => {
  console.log("当前应付:", debugCards(cards));

  const targetCardSize: number[] = Array.from(new Set([cards.length, 3, 4]));
  const combs = targetCardSize.flatMap((s) => getPermutations(cardPools, s));
  let ncombs = rmDup(combs);
  const ownCombs = ncombs[justNeedOne ? "find" : "filter"](
    (comb) => duel(cards, comb, cardPools.length - comb.length === 0) === true
  );

  console.log("建议出:", debugCards(ownCombs));
  return ownCombs;
};

/**
 * 获取推荐的片
 * @param cards 当前的牌
 * @param cardPools 牌池
 * @param justNeedOne 是否只需要一个建议
 * @returns
 */
export const tipsNumbers = (
  cards: number[],
  cardPools: number[],
  justNeedOne: boolean = true
) => {
  const targetCardSize: number[] = Array.from(new Set([cards.length, 3, 4]));
  const combs = targetCardSize.flatMap((s) => getPermutations(cardPools, s));
  let ncombs = rmDupNums(combs);
  const ownCombs = ncombs[justNeedOne ? "find" : "filter"](
    (comb) =>
      duelNumbers(cards, comb, cardPools.length - comb.length === 0) === true
  );
  return ownCombs;
};

export const gameTip = (game: Game): Card[] => {
  const needHandleTrick = getNeedHandleTrick(game);
  if (needHandleTrick === undefined) {
    if (game.tricks.length === 0) return [{ color: Color.Diamond, number: 3 }];
  }
  const cp = getGameCurrentPlayer(game);
  const currentCardPools = getCurrentCardsPool(game, cp);
  if (needHandleTrick === undefined) return currentCardPools.slice(0, 1);
  return tips(needHandleTrick.cards!, currentCardPools) as Card[];
};
