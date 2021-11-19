import { Card } from "./model";
import { tips } from "./Tip";

const C = (number: number): Card => ({ number, color: 1 });

const tip = (ns: number[], bs: number[]) => {
  return tips(ns.map(C), bs.map(C))
    .map((cs) => cs.map((c) => c.number).join(","))
    .join("@");
};

describe("测试提示功能", () => {
  it("单牌", () => {
    expect(tip([3], [4, 5, 6, 7])).toEqual("4@5@6@7");
    expect(tip([3, 3], [4, 4, 5, 6, 6, 7])).toEqual("4,4@6,6");
    expect(tip([3, 3], [4, 4, 5, 6, 6, 7, 4, 4])).toEqual("4,4@6,6@4,4,4,4");
  });

  it("三带", () => {
    expect(tip([3, 3, 3], [4, 4, 4, 5, 6, 6, 6, 7])).toEqual("4,4,4@6,6,6");
    expect(tip([3, 3, 3, 4], [4, 4, 4, 5, 6, 6, 6, 7])).toEqual(
      "4,4,4,5@6,6,6,4"
    );
    expect(tip([3, 3, 3, 4, 4], [4, 4, 4, 5, 6, 6, 7])).toEqual("4,4,4,6,6");
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
