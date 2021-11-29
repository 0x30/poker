import { Card } from "./model/Card";
import { CardsType, DeetectResult } from "./model/Detect";
import { count, countArray, monotone, nkeys, same, sort } from "./util";

const haveSame = (numbers: number[], target: number) => {
  const result = Object.entries(count(numbers)).find(
    ([_, count]) => count === target
  );
  if (result) return Number.parseInt(result[0]);
  return undefined;
};

const sameExclude = (numbers: number[], exclude: number, target: number) => {
  const res = countArray(numbers.filter((n) => n !== exclude));
  const r = res.find((r) => r.count === target);
  if (r) return r.number;
  return undefined;
};

/**
 * 是否为双顺或三顺
 */
const isShun = (numbers: number[], target: 2 | 3) => {
  const res = count(numbers);
  return monotone(nkeys(res)) && same(Object.values(res), target);
};

/**
 * 分辨牌型
 */
const detectTypeNumbers = (
  numbers: number[]
): [CardsType, number] | undefined => {
  if (numbers.length === 0) return undefined;
  if (numbers.length === 1) return [CardsType.dan, numbers[0]];

  if (numbers.length === 2) {
    if (numbers.toString() === "17,18") return [CardsType.zhadan, 18];
    if (same(numbers)) return [CardsType.dui, numbers[0]];
  }

  if (numbers.length === 3 && same(numbers))
    return [CardsType.santiao, numbers[0]];

  if (numbers.length === 4) {
    if (same(numbers)) return [CardsType.zhadan, numbers[0]];
    const res = haveSame(numbers, 3);
    if (res) return [CardsType.sandaiyi, res];
  }

  if (numbers.length >= 5) {
    if (numbers.length === 5) {
      const res = haveSame(numbers, 3);
      if (res && sameExclude(numbers, res, 2)) return [CardsType.sandaier, res];

      const same4Res = haveSame(numbers, 4);
      if (same4Res) return [CardsType.sidaiyi, same4Res];
    }

    if (monotone(numbers)) {
      return [CardsType.danshun, Math.max(...numbers)];
    }
  }

  if (numbers.length >= 6) {
    if (numbers.length === 6) {
      const res = haveSame(numbers, 4);
      if (res && sameExclude(numbers, res, 2)) return [CardsType.sidaier, res];
    }

    if (isShun(numbers, 2)) return [CardsType.shuangshun, Math.max(...numbers)];
  }
  return undefined;
};

/**
 * 对决
 * @param prev 上一组排
 * @param curr 当前牌组
 * @param currIsLast 是否为当前出牌人的最后一手
 */
const duelNumbers = (prev: number[], curr: number[]): boolean | undefined => {
  const prevRes = detectTypeNumbers(prev);
  const currRes = detectTypeNumbers(curr);

  if (currRes === undefined || prevRes === undefined) return undefined;

  const [currType, currWeight] = currRes;
  const [prevType, PrevWeight] = prevRes;

  if (currType === CardsType.zhadan) {
    if (prevType === CardsType.zhadan) return currWeight > PrevWeight;
    return true;
  }

  if (prev.length !== curr.length) return undefined;
  if (currType === prevType) return currWeight > PrevWeight;
  return undefined;
};

export const detect = (cards: Card[]): DeetectResult | undefined => {
  const result = detectTypeNumbers(sort(cards).map((c) => c.number));
  if (result === undefined) return undefined;
  const [type, weight] = result;
  return { cards, type, weight };
};

export const duel = (prev: Card[], curr: Card[]): boolean | undefined => {
  return duelNumbers(
    sort(prev).map((c) => c.number),
    sort(curr).map((c) => c.number)
  );
};
