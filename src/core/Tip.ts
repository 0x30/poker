import { hasFirstCard, jokers } from "./Card";
import { Card } from "./model";
import { CardsType, countArray, detect, monotone } from "./Referee";
import { useCache } from "./util";

const cardsHexStr = (cards: Card[]) => {
  return cards.map((c) => c.number.toString(32)).join("");
};

const removeDuplicate = (cards: Card[][]) => {
  /// 牌组去重
  const set = new Set<string>();
  const calculatorCards: Card[][] = [];
  for (const cs of cards) {
    const chs = cardsHexStr(cs);
    if (set.has(chs) === false) {
      set.add(chs);
      calculatorCards.push(cs);
    }
  }
  return calculatorCards;
};

/**
 * 返回重复的卡组组合集合
 * @param cards 卡组
 * @param repeat 重复
 * @returns
 */
const repeatCard = (cards: Card[], repeat: 2 | 3 | 4) => {
  const regExp = new RegExp(`(\\w)${"\\1".repeat(repeat - 1)}`, "g");
  const res: string[] = cardsHexStr(cards).match(regExp) ?? [];
  return res.map((v) =>
    cards
      .filter((c) => c.number === Number.parseInt(v.substr(0, 1), 32))
      .slice(0, repeat)
  );
};

const _re = (cs: Card[], exclude: number, repeat: 2 | 3 | 4) => {
  const regExp = new RegExp(`(\\w)${"\\1".repeat(repeat - 1)}`, "g");
  const cards = cs.filter((c) => c.number !== exclude);
  const res: string[] = cardsHexStr(cards).match(regExp) ?? [];
  return res
    .map((v) =>
      cards
        .filter((c) => c.number === Number.parseInt(v.substr(0, 1), 32))
        .slice(0, repeat)
    )
    .sort((a, b) => a[0].number - b[0].number);
};

const cache = useCache<ReturnType<typeof _re>>();
const re = (cs: Card[], exclude: number, repeat: 2 | 3 | 4) => {
  const key = `${cardsHexStr(cs)}${exclude}${repeat}`;
  return cache(key, () => _re(cs, exclude, repeat));
};

export const getSmalls = (cards: Card[], exclude: number[], size: number) => {
  const countsRes = countArray(
    cards.filter((c) => !exclude.includes(c.number)).map((c) => c.number)
  );
  const result = countsRes
    .filter((c) => c.count === size)
    .sort((a, b) => a.number - b.number);

  if (result.length <= 0 || result[0].number > 10) {
    return cards.filter((c) => !exclude.includes(c.number)).slice(0, size);
  }
  return cards.filter((c) => c.number === result[0].number);
};

const getCardsSame = (val: number, cards: Card[], size: 2 | 3) => {
  return cards.filter((c) => c.number === val).slice(0, size);
};

const kingBoom = (cards: Card[]): Card[][] => {
  if (/hi/.test(cardsHexStr(cards))) return [jokers];
  return [];
};

const danshunCards = (size: number, weight: number, cards: Card[]) => {
  const f: number[] = [];
  const eligibles = cards.filter((c) => {
    if (f.includes(c.number)) return false;
    if (c.number > weight - size + 1 && c.number < 15 /**小于 2 */) {
      f.push(c.number);
      return true;
    }
    return false;
  });
  if (eligibles.length < size) return [];
  return new Array(eligibles.length - size + 1)
    .fill(0)
    .map((v, i) => eligibles.slice(i, i + size))
    .filter((cs) => monotone(cs.map((c) => c.number)));
};

const repeatShunCards = (
  length: number,
  weight: number,
  cards: Card[],
  size: 2 | 3
) => {
  const duizis = repeatCard(cards, size).filter(
    (cs) => cs[0].number > weight - length / size
  );
  if (duizis.length < length / size) return [];
  const res = duizis.flatMap((cs) => cs);
  return danshunCards(length / size, weight, res).map((items) =>
    items.reduce(
      (t, c) => [...t, ...getCardsSame(c.number, res, 2)],
      [] as Card[]
    )
  );
};

export const tips = (cs: Card[], cardsPool: Card[]) => {
  const result = detect(cs);
  if (result === undefined) return [];
  const cards = cardsPool.sort((a, b) => a.number - b.number);

  /// 要返回的卡组
  const returnCards: Card[][] = [
    ...kingBoom(cards),
    ...repeatCard(cards, 4).filter((cs) => {
      /// 如果比较的是炸弹,那么需要比较大小，否则炸弹随便打
      if (result.type === CardsType.zhadan) return cs[0].number > result.weight;
      return true;
    }),
  ];

  if (cardsPool.length < cs.length) return returnCards;

  const typeHandleCards = () => {
    switch (result.type) {
      case CardsType.dan:
        return cards.filter((v) => v.number > result.weight).map((c) => [c]);
      case CardsType.dui:
        return repeatCard(cards, 2).filter(
          (cs) => cs[0].number > result.weight
        );
      case CardsType.santiao:
        return repeatCard(cards, 3).filter(
          (cs) => cs[0].number > result.weight
        );
      case CardsType.sandaiyi:
        return repeatCard(cards, 3)
          .filter((cs) => cs[0].number > result.weight)
          .map((cs) => [...cs, ...getSmalls(cards, [cs[0].number], 1)]);
      case CardsType.sandaier:
        return repeatCard(cards, 3)
          .filter(
            (cs) =>
              cs[0].number > result.weight &&
              re(cards, cs[0].number, 2).length > 0
          )
          .map((cs) => [...cs, ...re(cards, cs[0].number, 2)[0]]);
      case CardsType.danshun:
        return danshunCards(cs.length, result.weight, cards);
      case CardsType.shuangshun:
        return repeatShunCards(cs.length, result.weight, cards, 2);
      case CardsType.sidaier:
        return repeatCard(cards, 4)
          .filter(
            (cs) =>
              cs[0].number > result.weight &&
              re(cards, cs[0].number, 2).length > 0
          )
          .map((cs) => [...cs, ...re(cards, cs[0].number, 2)[0]]);
      case CardsType.sidaiyi:
        return repeatCard(cards, 4)
          .filter((cs) => cs[0].number > result.weight)
          .map((cs) => [...cs, ...getSmalls(cards, [cs[0].number], 1)]);
      case CardsType.zhadan:
        /// 前面已经处理过了
        break;
      default:
        break;
    }
    return [];
  };

  return [...removeDuplicate(typeHandleCards()), ...returnCards];
};
