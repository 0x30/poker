import { Card } from "./model";

export enum CardsType {
  /// 任意1张牌
  dan = 1,
  /// 数值相同的2张牌
  dui = 2,
  /// 三条 数值相同的3张牌。如3个4
  santiao = 3,
  /// 三带一 数值相同的3张牌＋单牌。如777＋5
  sandaiyi = 4,
  /// 三带二 数值相同的3张牌＋两张牌（2张单牌或者1个对牌）
  sandaier = 5,
  /// 单顺 数值3（含）以上的5张(含)以上连续单牌。
  danshun = 6,
  /// 双顺 2对(含)以上连续对牌。如3344、445566778899。
  shuangshun = 7,
  /// 三顺 2个(含)以上连续三条。如jjjqqq、444555666777888。
  sanshun = 8,
  /// 飞机带翅膀	 2个或3个连续的三带二。 如888999＋3457、888999+3355、888999+3367
  feijichibang = 9,
  /// 四带二
  sidaier = 10,
  /// 炸弹
  zhadan = 11,
}

export interface Result {
  type: CardsType;
  weight: number;
}

export const debugResult = (result: Result) => {
  switch (result.type) {
    case CardsType.dan:
      break;

    default:
      break;
  }
};

/**
 * 判断给定的数组是否完全相等
 * 如果 target 存在那么，将会和目标匹配
 */
const same = (numbers: number[], target?: number) => {
  return numbers.every((c, i, nums) => c === (target ?? nums[0]));
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
const count = (numbers: number[]) => {
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
const nkeys = (o: {}) => Object.keys(o).map((i) => Number.parseInt(i));

/**
 * 检查给定的数组是否连续自增+1的，比如 1,2,3
 */
export const monotone = (numers: number[]) => {
  return numers
    .sort((a, b) => a - b)
    .every((n, i, nums) => n === (nums[i - 1] ?? nums[0] - 1) + 1);
};

const haveSame = (numbers: number[], target: number) => {
  const res = countArray(numbers);
  const r = res.find((r) => r.count === target);
  if (r) return r.number;
  return undefined;
};

const isfeiji = (numbers: number[]) => {
  const res = countArray(numbers);
  const r = res.filter((r) => r.count === 3);
  if (r.length >= 2) {
    /// 没有正确带了翅膀
    if (r.length * 2 + r.length * 3 !== numbers.length) {
      return undefined;
    }
    const ns = r.map((i) => i.number);
    if (monotone(ns)) return Math.max(...ns);
  }
  return undefined;
};

/**
 * 是否为双顺或三顺
 */
const isShun = (numbers: number[], target: 2 | 3) => {
  const res = count(numbers);
  // 是否 去重后自增
  // 是否 相同的个数
  return monotone(nkeys(res)) && same(Object.values(res), target);
};

/**
 * 分辨牌型
 */
export const detectTypeNumbers = (numbers: number[]): Result | undefined => {
  if (numbers.length === 0) return undefined;
  if (numbers.length === 1) return { type: CardsType.dan, weight: numbers[0] };

  if (numbers.length === 2) {
    if (numbers.every((n) => [17, 18].includes(n))) {
      return { type: CardsType.zhadan, weight: Math.max(...numbers) };
    }
    if (same(numbers)) {
      return { type: CardsType.dui, weight: numbers[0] };
    }
  }

  if (numbers.length === 3 && same(numbers)) {
    // 三条A单出不带牌时是最大的炸弹，带牌时则作为普通牌型。
    // if (numbers[0] === 14) {
    //   return { type: CardsType.zhadan, weight: numbers[0] };
    // }
    return { type: CardsType.santiao, weight: numbers[0] };
  }

  if (numbers.length === 4) {
    if (same(numbers)) return { type: CardsType.zhadan, weight: numbers[0] };
    const res = haveSame(numbers, 3);
    if (res !== undefined) return { type: CardsType.sandaiyi, weight: res };
  }

  if (numbers.length === 5) {
    const res = haveSame(numbers, 3);
    if (res !== undefined) return { type: CardsType.sandaier, weight: res };
  }
  if (numbers.length === 6) {
    const res = haveSame(numbers, 4);
    if (res !== undefined) return { type: CardsType.sidaier, weight: res };
  }

  if (numbers.length === 10) {
    const res = isfeiji(numbers);
    if (res !== undefined) return { type: CardsType.feijichibang, weight: res };
  }

  if (numbers.length >= 4) {
    if (isShun(numbers, 2)) {
      return { type: CardsType.shuangshun, weight: Math.max(...numbers) };
    }
  }

  if (numbers.length >= 5) {
    if (Math.max(...numbers) < 15 && monotone(numbers)) {
      return { type: CardsType.danshun, weight: Math.max(...numbers) };
    }
    if (isShun(numbers, 3)) {
      return { type: CardsType.sanshun, weight: Math.max(...numbers) };
    }
  }

  return undefined;
};

/**
 * 对决
 * @param prev 上一组排
 * @param curr 当前牌组
 * @param currIsLast 是否为当前出牌人的最后一手
 */
export const duelNumbers = (
  prev: number[],
  curr: number[],
  currIsLast: boolean
): boolean | undefined => {
  const prevRes = detectTypeNumbers(prev);
  const currRes = detectTypeNumbers(curr);

  if (currRes === undefined || prevRes === undefined) {
    return undefined;
  }

  if (currRes.type === CardsType.zhadan) {
    if (prevRes.type === CardsType.zhadan)
      return currRes.weight > prevRes.weight;
    return true;
  }

  if (prev.length !== curr.length) return undefined;

  if (currRes.type === prevRes.type) {
    return currRes.weight > prevRes.weight;
  }

  return undefined;
};

export const detect = (cards: Card[]): Result | undefined => {
  return detectTypeNumbers(cards.map((c) => c.number));
};

export const duel = (
  prev: Card[],
  curr: Card[],
  currIsLast: boolean
): boolean | undefined => {
  return duelNumbers(
    prev.map((c) => c.number),
    curr.map((c) => c.number),
    currIsLast
  );
};
