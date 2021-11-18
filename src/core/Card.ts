import { shuffle } from "lodash";
import {
  Card,
  Color,
  GamePlayer,
  isWoodMan,
  Player,
  WoodmanPlayer,
} from "./model";

// 所有花色
const allColors = [Color.Club, Color.Diamond, Color.Heart, Color.Spade];

// 大小王
export const jokers: Card[] = [
  { color: Color.Spade, number: 17 },
  { color: Color.Heart, number: 18 },
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
  17: "JOKER",
  18: "JOKER",
};

const deColorsMap = {
  黑桃: Color.Spade,
  红桃: Color.Heart,
  方片: Color.Diamond,
  梅花: Color.Club,
};

const deNumberMap = {
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
  "2": 15,
  JOKER: 17,
};

export const EncodeCard = (card: Card): { number: string; color: string } => {
  return {
    number: (numberMap as any)[card.number],
    color: colorsMap[card.color],
  };
};

export const DecodeCard = (card: { number: string; color: string }): Card => {
  if (card.number === "JOKER" && card.color === "黑桃")
    return { number: 17, color: Color.Spade };
  if (card.number === "JOKER" && card.color === "红桃")
    return { number: 18, color: Color.Heart };
  return {
    number: (deNumberMap as any)[card.number],
    color: (deColorsMap as any)[card.color],
  };
};

export const debugCard = (cards: Card) => {
  const desc = (card: Card) => {
    if (card.number === 17 || card.number === 18)
      return `${numberMap[card.number]}`;
    return `${colorsMap[card.color]}${(numberMap as any)[card.number]}`;
  };
  return desc(cards);
};

export const debugCards = (cards: any) => {
  if (cards === undefined) return "无卡牌";
  return (cards as Card[])
    .sort((a, b) => a.number - b.number)
    .map(debugCard)
    .join(",");
};

// 一副牌
export const deskCards = [
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

export const splitCards = (players: Player[]): GamePlayer[] => {
  const hasWoodMan = players.find((p) => isWoodMan(p));
  const result = shuffle(deskCards);
  if (hasWoodMan) {
    if (hasFirstCard(result.slice(0, 8))) return splitCards(players);
    const users = players.filter((p) => !isWoodMan(p));
    return [
      new GamePlayer(WoodmanPlayer, result.slice(0, 8)),
      new GamePlayer(users[0], result.slice(8, 31)),
      new GamePlayer(users[1], result.slice(31, 54)),
    ];
  } else {
    return [
      new GamePlayer(players[0], result.slice(0, 18)),
      new GamePlayer(players[1], result.slice(18, 36)),
      new GamePlayer(players[2], result.slice(36, 54)),
    ];
  }
};

export const getCardAssets = (card: Card) => {
  const cs = {
    [Color.Spade]: "SPADE",
    [Color.Heart]: "HEART",
    [Color.Diamond]: "DIAMOND",
    [Color.Club]: "CLUB",
  };

  const ns: { [key: number]: string } = {
    3: "3",
    4: "4",
    5: "5",
    6: "6",
    7: "7",
    8: "8",
    9: "9",
    10: "10",
    11: "11-JACK",
    12: "12-QUEEN",
    13: "13-KING",
    14: "1",
    15: "2",
    17: "JOKER-2",
    18: "JOKER-3",
  };

  const name = () => {
    if (card.number === 17 || card.number === 18) return ns[card.number];
    return `${cs[card.color]}-${ns[card.number]}`;
  };

  return new URL(`../assets/cards/${name()}.svg`, import.meta.url).href;
};

export const firstCard: Card = { color: Color.Diamond, number: 3 };
/**
 * 是否是三
 * @param card 卡片
 * @returns 是否
 */
export const hasFirstCard = (cards: Card[]) =>
  cards.findIndex((c) => equal(c, firstCard)) !== -1;
