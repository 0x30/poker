import { Card } from "./model";
import { duel, duelNumbers } from "./Referee";
import { getPermutations } from "./util";

const rmDup = (cards: Card[][]) => {
  const pools: { [key: string]: 0 } = {};
  const a: Card[][] = [];

  for (const cs of cards) {
    const key = cs
      .sort((a, b) => a.number - b.number)
      .map((r) => r.number)
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
  const targetCardSize: number[] = Array.from(new Set([cards.length, 3, 4]));
  const combs = targetCardSize.flatMap((s) => getPermutations(cardPools, s));
  let ncombs = rmDup(combs);
  const ownCombs = ncombs[justNeedOne ? "find" : "filter"](
    (comb) => duel(cards, comb, cardPools.length - comb.length === 0) === true
  );
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

(window as any).tipsNumbers = tipsNumbers;
