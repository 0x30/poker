import { isReactive, toRaw } from "vue";
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

/**
 * 是否是三
 * @param card 卡片
 * @returns 是否
 */
const hasDiamond3 = (cards: Card[]) =>
  cards.findIndex((c) => c.color === Color.Diamond && c.number === 3) !== -1;

export const lastTricks = (game: Game): Trick[] | undefined => {
  return game.tricks
    .slice(-1)
    .sort((a, b) => b.idx - a.idx)[0]
    .tricks.sort((a, b) => b.createTime - a.createTime);
};

export const getNeedHandleTrick = (game: Game) => {
  if (game.tricks.length === 0) return undefined;
  const lts = lastTricks(game);

  if ((lts?.length ?? 0) > 2) {
    if (lts?.slice(0, 2)?.every((t) => t.cards === undefined) === true) {
      return undefined;
    }
  }
  return lts?.find((t) => t.cards !== undefined);
};

export const currentPlayer = (game: Game) => {
  // 当前没有回合.默认获取 黑桃三 的拥有者作为当前用户
  if (game.tricks.length === 0) {
    return game.players.find((p) => hasDiamond3(p.cards))!;
  }
  if (getNeedHandleTrick(game) === undefined) {
    const pid = lastTricks(game)?.slice(2, 3)[0].player.id;
    return game.players.find((p) => p.id === pid)!;
  }
  const lastPlayer = lastTricks(game)?.[0].player;
  const li = game.players.findIndex((p) => p.id === lastPlayer?.id);
  return game.players[(li + 2) % 3];
};
