import {
  detectTypeNumbers as dt,
  Result,
  CardsType,
  duelNumbers as dn,
} from "./Referee";

const r = (type: CardsType, weight: number): Result => ({ type, weight });

describe("分辨牌型", () => {
  it("炸弹", () => {
    expect(dt([14, 14, 14, 14])).toEqual(r(CardsType.zhadan, 14));
    expect(dt([14, 14, 14])).toEqual(r(CardsType.zhadan, 14));
    expect(dt([3, 3, 3, 3])).toEqual(r(CardsType.zhadan, 3));
  });

  it("单牌", () => {
    expect(dt([3])).toEqual(r(CardsType.dan, 3));
    expect(dt([3, 4])).not.toEqual(r(CardsType.dan, 1));
  });

  it("对子", () => {
    expect(dt([3, 3])).toEqual(r(CardsType.dui, 3));
  });

  it("三条", () => {
    expect(dt([3, 3, 3])).toEqual(r(CardsType.santiao, 3));
  });

  it("三带一", () => {
    expect(dt([3, 3, 3, 4])).toEqual(r(CardsType.sandaiyi, 3));
  });

  it("三带二", () => {
    expect(dt([3, 3, 3, 4, 4])).toEqual(r(CardsType.sandaier, 3));
  });

  it("单顺", () => {
    expect(dt([9, 10, 11, 12, 13, 14])).toEqual(r(CardsType.danshun, 14));
    expect(dt([9, 10, 11, 12, 13, 15])).toBeUndefined();
    expect(dt([3, 4, 5, 6, 7])).toEqual(r(CardsType.danshun, 7));
    expect(dt([3, 4, 5])).not.toEqual(r(CardsType.danshun, 5));
  });

  it("双顺", () => {
    expect(dt([3, 3, 4, 4])).toEqual(r(CardsType.shuangshun, 4));
    expect(dt([3, 6, 3, 4, 5, 5, 4, 6, 7, 7])).toEqual(
      r(CardsType.shuangshun, 7)
    );
  });

  it("三顺", () => {
    expect(dt([3, 3, 3, 4, 4, 4])).toEqual(r(CardsType.sanshun, 4));
    expect(dt([3, 3, 3, 5, 5, 6, 6, 5, 6, 4, 4, 4])).toEqual(
      r(CardsType.sanshun, 6)
    );
  });

  it("飞机带翅膀", () => {
    expect(dt([3, 3, 3, 4, 4, 4, 5, 6, 7, 8])).toEqual(
      r(CardsType.feijichibang, 4)
    );
  });

  it("四带二", () => {
    expect(dt([3, 3, 3, 3, 4, 4])).toEqual(r(CardsType.sidaier, 3));
  });
});

describe("比较牌的大小", () => {
  it("单牌比较", () => {
    expect(dn([3], [4], true)).toBe(true);
    expect(dn([3], [4, 4], false)).toBeUndefined();
  });

  it("对子比较", () => {
    expect(dn([3, 3], [4, 4], false)).toBe(true);
  });

  it("三条比较", () => {
    expect(dn([3, 3, 3], [4, 4, 4], false)).toBe(true);
    // expect(dn([3, 3, 3], [4, 4, 4, 3], true)).toBe(true);
    // expect(dn([3, 3, 3, 4, 5], [4, 4, 4, 3], true)).toBe(true);
    // expect(dn([3, 3, 3, 4, 5], [4, 4, 4, 3], false)).toBe(undefined);
  });

  it("炸弹", () => {
    expect(dn([3, 3, 3, 3, 4, 4], [4, 4, 4, 4], true)).toBe(true);
    expect(dn([3, 3, 3, 3], [14, 14, 14], true)).toBe(true);
  });

  it("双顺", () => {
    expect(dn([3, 3, 4, 4], [3, 3, 4, 4], true)).toBe(false);
    expect(dn([3, 3, 4, 4], [4, 4, 5, 5], true)).toBe(true);
    expect(dn([3, 3, 4, 4], [4, 4, 5, 5, 6, 6], true)).toBeUndefined();
  });

  it("三顺", () => {
    expect(dn([3, 3, 3, 4, 4, 4], [4, 4, 4, 5, 5, 5], true)).toBe(true);
    expect(
      dn([3, 3, 3, 4, 4, 4], [4, 4, 4, 5, 5, 5, 6, 6, 6], true)
    ).toBeUndefined();
  });

  it("飞机带翅膀", () => {
    expect(
      dn(
        [3, 3, 3, 4, 4, 4, 6, 6, 7, 7],
        [4, 4, 4, 5, 5, 5, 10, 11, 12, 13],
        true
      )
    ).toBe(true);
  });

  it("单顺", () => {
    expect(dn([4, 5, 6, 7, 8, 9], [9, 10, 11, 12, 13], true)).toBeUndefined();
    expect(dn([4, 5, 6, 7, 8, 9], [9, 10, 11, 12, 13, 14], true)).toBe(true);
    expect(dn([4, 5, 6, 7, 8, 9, 10], [4, 5, 6, 7, 8, 9, 10], true)).toBe(
      false
    );
  });
});
