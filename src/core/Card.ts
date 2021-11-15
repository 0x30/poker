// https://github.com/selfthinker/CSS-Playing-Cards
import { shuffle, chunk } from "lodash";
import { Card, Color } from "./model";

// 所有花色
const allColors = [Color.Club, Color.Diamond, Color.Heart, Color.Spade];

// 大小王
const jokers: Card[] = [
  { color: 1, number: 17 },
  { color: 2, number: 18 },
];

const colorsMap = {
  [Color.Spade]: "黑桃",
  [Color.Heart]: "红桃",
  [Color.Diamond]: "方片",
  [Color.Club]: "梅花",
};

const numberMap = {
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "10",
  11: "J",
  12: "Q",
  13: "K",
  14: "A",
  15: "2",
  17: "小王",
  18: "大王",
};

export const debugCards = (cards: any) => {
  if (cards === undefined) return "[无提示]";

  return (cards as Card[])
    .map((c) => {
      if ((numberMap as any)[c.number] === undefined) {
        console.log(c.number, c.color, "找不到");
      }
      return `${colorsMap[c.color]}${(numberMap as any)[c.number]}`;
    })
    .join(",");
};

// 一副牌
const cards = [
  ...allColors.flatMap((c) =>
    new Array(13).fill(1).map<Card>((v, idx) => ({ color: c, number: idx + 3 }))
  ),
  ...jokers,
];

/**
 * 3  | 3
 * 4  | 4
 * 5  | 5
 * 6  | 6
 * 7  | 7
 * 8  | 8
 * 9  | 9
 * 10 | 10
 * 11 | J
 * 12 | Q
 * 13 | K
 * 14 | A
 * 15 | 2
 * 16 | foker
 * 17 | foker
 */

export const equal = (card1: Card, card2: Card) =>
  card1.color === card2.color && card1.number === card2.number;

/**
 * 获得 "跑得快" 的卡片
 * 直接随机，并且分成三份
 * @returns 分成三份的随机扑克牌卡组
 */
export const getRunFastCards = (group: number = 3) => {
  // 跑得快游戏共使用48张牌，去掉大、小王，红桃2，方片2，梅花2和黑桃A
  const result = cards.filter((card) => {
    if (card.number === 15) {
      if ([Color.Club, Color.Diamond, Color.Spade].includes(card.color)) {
        return false;
      }
    }
    if (card.number === 14 && card.color === Color.Spade) return false;
    if (card.number === 18 || card.number === 17) return false;
    return true;
  });
  return chunk(shuffle(result), Math.floor(result.length / group));
};
