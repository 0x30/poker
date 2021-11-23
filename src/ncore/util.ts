import { Card, Color } from "./model/Card";

/**
 * 判断给定的数组是否完全相等
 * 如果 target 存在那么，将会和目标匹配
 */
export const same = (numbers: number[], target?: number) => {
  const t = target ?? numbers[0];
  return numbers.every((c) => c === t);
};

/**
 * 统计数字出现的次数  [1,1,2,3,4]
 * {
 *  1: 2,
 *  2: 1,
 *  3: 1,
 *  4: 1,
 * }
 */
export const count = (numbers: number[]) => {
  return numbers.reduce((t, c) => {
    t[c] = (t[c] ?? 0) + 1;
    return t;
  }, {} as { [key: number]: number });
};

/**
 * 统计数字出现的次数  [1,1,2]
 * [{
 * number: 1,
 * count: 2
 * },{
 * number: 2,
 * count: 1
 * }]
 */
export const countArray = (numbers: number[]) => {
  const res = count(numbers);
  return nkeys(res).map((k) => ({ number: k, count: res[k] }));
};

/**
 * 获得 对象 number 类型 keys
 */
export const nkeys = (o: {}) => Object.keys(o).map((i) => Number.parseInt(i));

/**
 * 检查给定的数组是否连续自增+1的，比如 1,2,3
 * numbers 已经排好序的卡数组
 */
export const monotone = (numers: number[]) => {
  return numers.every((n, i, nums) => n === (nums[i - 1] ?? nums[0] - 1) + 1);
};

/**
 * 卡组排序
 * @param cards
 * @returns
 */
export const sort = (cards: Card[]) => {
  if ((cards as any)["sorted"] === true) return cards;
  (cards as any)["sorted"] = true;
  return cards.slice().sort((a, b) => a.number - b.number);
};

export const equal = (card1: Card, card2: Card) =>
  card1.color === card2.color && card1.number === card2.number;

export const firstCard: Card = { color: Color.Diamond, number: 3 };

// 大小王
export const jokers: Card[] = [
  { color: Color.Spade, number: 17 },
  { color: Color.Heart, number: 18 },
];

/**
 * 是否是三
 * @param card 卡片
 * @returns 是否
 */
export const hasFirstCard = (cards: Card[]) =>
  cards.findIndex((c) => equal(c, firstCard)) !== -1;
