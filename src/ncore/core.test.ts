import { detect, duel } from "./detect";
import { Card } from "./model/Card";
import { CardsType, DeetectResult } from "./model/Detect";
import { tips } from "./Tip";

const C = (number: number): Card => ({ number, color: 1 });

const de = (cards: number[], type?: CardsType, weight?: number) => {
  const result = detect(cards.map(C));
  return result?.type === type && result?.weight === weight;
};

const du = (cards: number[], cards2: number[]) => {
  return duel(cards.map(C), cards2.map(C));
};

const tip = (ns: number[], bs: number[]) => {
  return tips(ns.map(C), bs.map(C))
    .map((cs) => cs.map((c) => c.number).join(","))
    .join("@");
};

const r = (type: CardsType, weight: number) => ({ type, weight });

describe("分辨牌型", () => {
  it("炸弹", () => {
    expect(de([14, 14, 14, 14], CardsType.zhadan, 14)).toEqual(true);
    expect(de([18, 17], CardsType.zhadan, 18)).toEqual(true);
    expect(de([3, 3, 3, 3], CardsType.zhadan, 3)).toEqual(true);
  });

  it("单牌", () => {
    expect(de([3], CardsType.dan, 3)).toEqual(true);
  });

  it("对子", () => {
    expect(de([3, 3], CardsType.dui, 3)).toEqual(true);
  });

  it("三条", () => {
    expect(de([3, 3, 3], CardsType.santiao, 3)).toEqual(true);
  });

  it("三带一", () => {
    expect(de([3, 3, 3, 4], CardsType.sandaiyi, 3)).toEqual(true);
  });

  it("三带二", () => {
    expect(de([3, 3, 3, 4, 4], CardsType.sandaier, 3)).toEqual(true);
    expect(de([3, 3, 3, 4, 5])).toEqual(true);
  });

  it("单顺", () => {
    expect(de([9, 10, 11, 12, 13, 14], CardsType.danshun, 14)).toEqual(true);
    expect(de([9, 10, 11, 12, 13, 15])).toEqual(true);
    expect(de([3, 4, 5, 6, 7], CardsType.danshun, 7)).toEqual(true);
    expect(de([3, 4, 5])).toEqual(true);
  });

  it("双顺", () => {
    expect(de([3, 3, 4, 4])).toEqual(true);
    expect(de([3, 6, 3, 4, 5, 5, 4, 6, 7, 7], CardsType.shuangshun, 7)).toEqual(
      true
    );
  });

  it("四带二", () => {
    expect(de([3, 3, 3, 3, 4, 4], CardsType.sidaier, 3)).toEqual(true);
    expect(de([3, 3, 3, 3, 4, 5])).toEqual(true);
  });

  it("四带一", () => {
    expect(de([3, 3, 3, 3, 4], CardsType.sidaiyi, 3)).toEqual(true);
  });
});

describe("比较牌的大小", () => {
  it("单牌比较", () => {
    expect(du([3], [4])).toBe(true);
    expect(du([3], [4, 4])).toBeUndefined();
  });

  it("对子比较", () => {
    expect(du([3, 3], [4, 4])).toBe(true);
  });

  it("三条比较", () => {
    expect(du([3, 3, 3], [4, 4, 4])).toBe(true);
  });

  it("炸弹", () => {
    expect(du([3, 3, 3, 3, 4, 4], [4, 4, 4, 4])).toBe(true);
    expect(du([3, 3, 3, 3], [14, 14, 14, 14])).toBe(true);
    expect(du([3, 3, 3, 3], [17, 18])).toBe(true);
  });

  it("双顺", () => {
    expect(du([3, 3, 4, 4, 5, 5], [3, 3, 4, 4, 5, 5])).toBe(false);
    expect(du([3, 3, 4, 4, 5, 5], [4, 4, 5, 5, 6, 6])).toBe(true);
    expect(du([3, 3, 4, 4, 5, 5], [4, 4, 5, 5, 6, 6, 7, 7])).toBeUndefined();
  });

  it("单顺", () => {
    expect(du([4, 5, 6, 7, 8, 9], [9, 10, 11, 12, 13])).toBeUndefined();
    expect(du([4, 5, 6, 7, 8, 9], [9, 10, 11, 12, 13, 14])).toBe(true);
    expect(du([4, 5, 6, 7, 8, 9, 10], [4, 5, 6, 7, 8, 9, 10])).toBe(false);
  });

  it("四带一比较", () => {
    expect(du([4, 4, 4, 4, 8], [5, 5, 5, 5, 13])).toBe(true);
    expect(du([4, 5, 6, 7, 8, 9], [9, 10, 11, 12, 13, 14])).toBe(true);
    expect(du([4, 5, 6, 7, 8, 9, 10], [4, 5, 6, 7, 8, 9, 10])).toBe(false);
  });
});

describe("测试提示功能", () => {
  it("单牌", () => {
    expect(tip([3], [4, 5, 6, 7])).toEqual("4@5@6@7");
    expect(tip([3, 3], [4, 4, 5, 6, 6, 7])).toEqual("4,4@6,6");
    expect(tip([3, 3], [4, 4, 5, 6, 6, 7, 4, 4])).toEqual("6,6@4,4,4,4");
  });

  it("三带", () => {
    expect(tip([3, 3, 3], [4, 4, 4, 5, 6, 6, 6, 7])).toEqual("4,4,4@6,6,6");
    expect(tip([3, 3, 3, 4], [4, 4, 4, 5, 6, 6, 6, 7])).toEqual(
      "4,4,4,5@6,6,6,5"
    );
    expect(tip([3, 3, 3, 4, 4], [4, 4, 4, 5, 6, 6, 7])).toEqual("4,4,4,6,6");
    expect(tip([3, 3, 3, 4, 4], [4, 4, 4, 5, 6, 6, 6, 7, 7])).toEqual(
      "4,4,4,7,7@6,6,6,7,7"
    );
    expect(tip([3, 3, 3, 4, 4], [4, 4, 4, 5, 6, 7])).toEqual("");
  });

  it("单顺", () => {
    expect(tip([3, 4, 5, 6, 7], [4, 4, 4, 5, 6, 6, 6, 7, 8])).toEqual(
      "4,5,6,7,8"
    );
    expect(tip([3, 4, 5, 6, 7], [4, 4, 4, 5, 6, 6, 6, 7, 8, 9, 10])).toEqual(
      "4,5,6,7,8@5,6,7,8,9@6,7,8,9,10"
    );
  });

  it("双顺", () => {
    expect(
      tip(
        [3, 3, 4, 4, 5, 5, 6, 6, 7, 7],
        [4, 4, 4, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8]
      )
    ).toEqual("4,4,5,5,6,6,7,7,8,8");
  });

  it("炸弹", () => {
    expect(tip([2, 2, 2, 2], [17, 18])).toEqual("17,18");
    expect(tip([3, 3, 3, 3], [15, 15, 15, 15, 5, 5])).toEqual("15,15,15,15");
  });
});
