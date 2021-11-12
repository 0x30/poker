import { shuffle, chunk } from "lodash";

/**
 * 扑克牌的花色
 */
export enum Color {
  // 黑桃
  Spade = 1,
  // 桃心
  Heart = 2,
  // 方片
  Diamond = 3,
  // 梅花
  Club = 4,
}

/**
 * 扑克卡片
 */
export interface Card {
  // 花色
  color: Color;
  // 值
  number: number;
}

// 所有花色
const allColors = [Color.Club, Color.Diamond, Color.Heart, Color.Spade];

// 大小王
const jokers: Card[] = [
  { color: 1, number: 17 },
  { color: 2, number: 18 },
];

// 一副牌
const cards = [
  ...allColors.flatMap((c) =>
    new Array(13).fill(1).map<Card>((v, idx) => ({ color: c, number: idx + 3 }))
  ),
  ...jokers,
];

/**
 * 是否是红桃三
 * @param card 卡片
 * @returns 是否
 */
export const isHeaderThree = (card: Card) =>
  card.color === Color.Heart && card.number === 3;

/**
 * 获得 "跑得快" 的卡片
 * 直接随机，并且分成三份
 * @returns 分成三份的随机扑克牌卡组
 */
export const getRunFastCards = (group: number = 3) =>
  chunk(shuffle(cards), Math.floor(cards.length / group));
