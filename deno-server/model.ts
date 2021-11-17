// 扑克
export interface Card {
  /// 花色 黑桃,红桃,方片,梅花
  color: string;
  /// 3,4,5,6,7,8,9,10,J,Q,K,A,2,JOKER
  /// 小王为 黑桃 JOKER 大王为 红桃 JOKER
  number: string;
}

export interface Player {
  id: string;
  nikeName: string;
  host: string;
  createTime: number;
}

export interface Trick {
  createTime: number;
  player: Player;
  cards: Card[];
}

export interface DealRequest {
  gameId: string;
  cards: Card[];
  userId: string;
}

export interface AskRequest {
  gameId: string;
  /// 游戏出牌历史
  history: Trick[];
  /// 提示卡组 如果无则没有提示卡牌
  tips?: Card[];
  /// 需要压上的卡组
  needHandleTrick: Trick;
  userId: string;
}

export interface AskResponse {
  data?: Card[];
}

export interface BroadcastRequest {
  gameId: string;
  trick: Trick;
  userId: string;
}
