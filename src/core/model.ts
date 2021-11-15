import { generateId } from "./util";

/**
 * 扑克牌的花色
 */
export enum Color {
  // 黑桃
  Spade = 1,
  // 桃心
  Heart = 2,
  // 方片
  Diamond = 3,
  // 梅花
  Club = 4,
}

/**
 * 扑克卡片
 */
export interface Card {
  // 花色
  color: Color;
  // 值
  number: number;
}

export class Player {
  // 唯一标识
  id: string;

  // 昵称
  nikeName?: string;
  // 主机地址
  host: string;

  // 加入次数
  joinCount: number;
  // 胜利次数
  victoryCount: number;

  // 创建时间
  createTime: number;

  constructor(host: string, nikeName?: string) {
    this.id = generateId();
    this.nikeName = nikeName;
    this.joinCount = 0;
    this.victoryCount = 0;
    this.host = host;
    this.createTime = new Date().getTime();
  }
}

export class Trick {
  createTime: number;
  player: Player;
  cards: Card[] | undefined = [];

  constructor(player: Player, cards: Card[] | undefined) {
    this.createTime = new Date().getTime();
    this.player = player;
    this.cards = cards;
  }
}

export class Game {
  id: string;
  players: GamePlayer[];

  /// 回合数
  tricks: { tricks: Trick[]; idx: number }[] = [];

  /// 胜利者
  championer?: Player;

  /// 创建游戏后 是否自动开始
  autoStart: boolean;

  constructor(players: GamePlayer[], autoStart: boolean) {
    this.id = generateId();
    this.players = players;
    this.autoStart = autoStart;
  }
}

export class GamePlayer extends Player {
  cards: Card[];

  constructor(player: Player, cards: Card[]) {
    super(player.host, player.nikeName);
    this.cards = cards;
  }
}
