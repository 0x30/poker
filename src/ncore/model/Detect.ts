import { Card } from "./Card";

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
  /// 双顺 3对(含)以上连续对牌。如3344、445566778899。
  shuangshun = 7,
  /// 四带一
  sidaiyi = 10,
  /// 四带二
  sidaier = 11,
  /// 炸弹
  zhadan = 13,
}

export interface DeetectResult {
  cards: Card[];
  type: CardsType;
  weight: number;
}
