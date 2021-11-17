// 扑克
export interface Card {
  /// 花色 黑桃,红桃,方片,梅花
  color: string;
  /// 3,4,5,6,7,8,9,10,J,Q,K,A,2,JOKER
  /// 小王为 黑桃 JOKER 大王为 红桃 JOKER
  number: string;
}

export interface Player {
  /// 游戏ID
  id: string;
  /// 游戏的昵称
  nikeName: string;
  /// 访问的 host.就是你的服务器完整地址。比如 172.16.41.74:8000
  host: string;
  /// 这个玩家的创建时间
  createTime: number;
}

/// 某个出牌阶段
export interface Trick {
  /// 出牌的时间
  createTime: number;
  /// 出牌的用户
  player: Player;
  /// 出牌的内容
  cards: Card[];
}

export interface DealRequest {
  /// 一个服务器可能会同时出现，多场游戏，游戏ID可以区分
  gameId: string;
  /// 这是游戏开始的时候，你的初始牌组
  cards: Card[];
  /// 一个服务器是可以被添加多个用户的，用户ID可以区分
  userId: string;
}

export interface AskRequest {
  /// 一个服务器可能会同时出现，多场游戏，游戏ID可以区分
  gameId: string;
  /// 游戏出牌动作历史，可以不处理广播，直接从这个历史中，推演出当前的已经出的卡牌和剩余卡牌
  history: Trick[];
  /// 提示卡组 如果无则没有提示卡牌。这是 平台JS 根据你当前的牌组，帮你找到的最小的可以刚好压上对手的卡组，如果没有。则表示你没有牌出，除非我算错了
  tips?: Card[];
  /// 上一家的出得牌，你需要压上的卡组
  needHandleTrick: Trick;
  /// 一个服务器是可以被添加多个用户的，用户ID可以区分
  userId: string;
}

export interface AskResponse {
  /// 返回要出的卡牌
  /// 不反回 data 则为 跳过 pass
  data?: Card[];
}

/// 在用户出牌之后，会将这个动作广播给所有人，包括出牌者自己
export interface BroadcastRequest {
  /// 一个服务器可能会同时出现，多场游戏，游戏ID可以区分
  gameId: string;
  /// 出牌的回合详情
  trick: Trick;
  /// 一个服务器是可以被添加多个用户的，用户ID可以区分
  userId: string;
}
