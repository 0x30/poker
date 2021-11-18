import { jokers } from "./Card";
import {
  getCurrentCardsPool,
  getGameCurrentPlayer,
  getNeedHandleTrick,
} from "./Game";
import { Card, Color, Game } from "./model";
import { CardsType, detect, monotone, Result } from "./Referee";
import { useCache } from "./util";

const cardsHexStr = (cards: Card[]) => {
  return cards.map((c) => c.number.toString(32)).join("");
};

/// 是否存在炸弹,返回存在的炸弹
const repeatCard = (cards: Card[], repeat: 2 | 3 | 4) => {
  const regExp = new RegExp(`(\\w)${"\\1".repeat(repeat - 1)}`, "g");
  const res: string[] = cardsHexStr(cards).match(regExp) ?? [];
  return res.map((v) =>
    cards
      .filter((c) => c.number === Number.parseInt(v.substr(0, 1), 32))
      .slice(0, repeat)
  );
};

const getSmalls = (cards: Card[], exclude: number[], size: number) => {
  return cards.filter((c) => !exclude.includes(c.number)).slice(0, size);
};

const getCardsSame = (val: number, cards: Card[], size: 2 | 3) => {
  return cards.filter((c) => c.number === val).slice(0, size);
};

const kingBoom = (cards: Card[]): Card[][] => {
  if (/hi/.test(cardsHexStr(cards))) return [jokers];
  return [];
};

const danshunCards = (size: number, result: Result, cards: Card[]) => {
  const f: number[] = [];
  const eligibles = cards.filter((c) => {
    if (f.includes(c.number)) return false;
    if (c.number > result.weight - size + 1 && c.number < 15 /**小于 2 */) {
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
  result: Result,
  cards: Card[],
  size: 2 | 3
) => {
  const duizis = repeatCard(cards, size).filter(
    (cs) => cs[0].number > result.weight - length / size
  );
  if (duizis.length < length) return [];
  const res = duizis.flatMap((cs) => cs);
  return danshunCards(length / size, result, res).map((items) =>
    items.reduce(
      (t, c) => [...t, ...getCardsSame(c.number, res, 2)],
      [] as Card[]
    )
  );
};

const feijichibangCards = (length: number, result: Result, cards: Card[]) => {
  const res = repeatShunCards((length / 5) * 3, result, cards, 3);
  const exclude = res.map((cs) => cs[0].number);
  return res.map((cs) => [...cs, ...getSmalls(cards, exclude, 2 * cs.length)]);
};

const tips = (cs: Card[], cardsPool: Card[]) => {
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
          .filter((cs) => cs[0].number > result.weight)
          .map((cs) => [...cs, ...getSmalls(cards, [cs[0].number], 2)]);
      case CardsType.danshun:
        return danshunCards(cs.length, result, cards);
      case CardsType.shuangshun:
        return repeatShunCards(cs.length, result, cards, 2);
      case CardsType.sanshun:
        return repeatShunCards(cs.length, result, cards, 3);
      case CardsType.feijichibang:
        return feijichibangCards(cs.length, result, cards);
      case CardsType.sidaier:
        return repeatCard(cards, 4)
          .filter((cs) => cs[0].number > result.weight)
          .map((cs) => [...cs, ...getSmalls(cards, [cs[0].number], 2)]);
      case CardsType.zhadan:
        /// 前面已经处理过了
        break;
      default:
        break;
    }
    return [];
  };

  return [...typeHandleCards(), ...returnCards];
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
    (a, b) => a.type * 10 + a.weight - (b.type * 10 + b.weight)
  )[0]?.cards;
};
