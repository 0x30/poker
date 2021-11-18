import { ref, toRaw, triggerRef } from "vue";
import { debugCard, equal, firstCard, hasFirstCard } from "./Card";
import { useGames } from "./Games";
import { Card, Game, Player, Trick } from "./model";
import { detect, duel } from "./Referee";

import { askTrick, broadcast, deal } from "./req";

const getGameLastTricks = (game: Game): Trick[] | undefined => {
  return game.tricks
    .slice(-1)
    .sort((a, b) => b.idx - a.idx)[0]
    .tricks.sort((a, b) => b.createTime - a.createTime);
};

export const getNeedHandleTrick = (game: Game) => {
  if (game.tricks.length === 0) return undefined;
  const lts = getGameLastTricks(game);

  if ((lts?.length ?? 0) > 2) {
    if (lts?.slice(0, 2)?.every((t) => t.cards === undefined) === true) {
      return undefined;
    }
  }
  return lts?.find((t) => t.cards !== undefined);
};

/**
 * 根据提供的游戏以及玩家，根据出牌栈，获取用户当前的卡片剩余情况
 */
export const getCurrentCardsPool = (game: Game, player: Player) => {
  const removeCards = game.tricks
    .flatMap((ts) => ts.tricks.map((t) => t))
    .filter((t) => t.player.id === player.id && t.cards !== undefined)
    .flatMap((t) => t.cards as Card[]);
  const initCards = game.players.find((p) => p.id === player.id)!.cards;
  return initCards.filter(
    (c) => removeCards.find((rc) => equal(rc, c)) === undefined
  );
};

export const check = (game: Game, trick: Trick) => {
  const needHandleTrick = getNeedHandleTrick(game);
  /// 不需要进行处理排除
  if (needHandleTrick === undefined) {
    if (trick.cards === undefined) throw new Error("本次无需应答，必须出牌");

    if (game.tricks.length === 0 && hasFirstCard(trick.cards) === false) {
      throw new Error(`首轮出牌，必须存在 ${debugCard(firstCard)}`);
    }
  }

  /// pass
  if (trick.cards === undefined) return trick;
  /// 牌型判断
  if (detect(trick.cards) === undefined) throw new Error("牌型有问题");

  /// 确认 出得牌 是否都在当前牌库内
  const currentCardPolls = getCurrentCardsPool(game, trick.player);
  if (
    trick.cards.every(
      (c) => currentCardPolls.find((cc) => equal(cc, c)) !== undefined
    ) === false
  ) {
    throw new Error("卡牌不全，请检查");
  }
  if (needHandleTrick?.cards === undefined) return trick;
  if (
    duel(
      needHandleTrick.cards,
      trick.cards,
      currentCardPolls.length === trick.cards.length
    )
  ) {
    return trick;
  }
  throw new Error("牌型有问题，打不过");
};

/**
 * 检查游戏是否完成
 */
export const checkGameFinish = (game: Game, player: Player) => {
  const pools = getCurrentCardsPool(game, player);
  return pools.length === 0;
};

export const isGameFinish = (game: Game) => game.championer !== undefined;

/**
 * 获取游戏当前的用户
 */
export const getGameCurrentPlayer = (game: Game) => {
  // 当前没有回合.默认获取 黑桃三 的拥有者作为当前用户
  if (game.tricks.length === 0) {
    return game.players.find((p) => hasFirstCard(p.cards))!;
  }
  if (getNeedHandleTrick(game) === undefined) {
    const pid = getGameLastTricks(game)?.slice(2, 3)[0].player.id;
    return game.players.find((p) => p.id === pid)!;
  }
  const lastPlayer = getGameLastTricks(game)?.[0].player;
  const li = game.players.findIndex((p) => p.id === lastPlayer?.id);
  return game.players[(li + 2) % 3];
};

export const getGamePlayerLastCards = (game: Game, player: Player) => {
  if (game.tricks.length === 0) return undefined;
  return getGameLastTricks(game)?.find((t) => t.player.id === player.id);
};

/**
 * 获取游戏玩家的深入信息
 */
export const getGamePlayers = (game: Game) => {
  const cp = getGameCurrentPlayer(game);
  return game.players.map((p) => {
    return {
      ...p,
      ...{
        lastTrick: getGamePlayerLastCards(game, p),
        currentPlayer: cp.id === p.id,
        leftCards: getCurrentCardsPool(game, p),
      },
    };
  });
};

const __useGameCache: { [key: string]: ReturnType<typeof __useGame> } = {};

const __useGame = (g: Game) => {
  const gameRef = ref(g);

  const { updateGame } = useGames();

  const isAsking = ref(false);

  const toggle = () => {
    gameRef.value.autoStart = !gameRef.value.autoStart;
    if (gameRef.value.autoStart === true) moveCursor();
    updateGame(gameRef.value);
  };

  const start = async () => {
    if (gameRef.value.championer !== undefined) return;
    await deal(gameRef.value);
    if (gameRef.value.autoStart === true) moveCursor();
  };

  const manualPlay = (player: Player, cards?: Card[]) => {
    const trick = new Trick(player, cards);
    handleTrick(trick);
  };

  const trashTricks = () => {
    gameRef.value.tricks = [];
    triggerRef(gameRef);
    updateGame(gameRef.value);
  };

  const cancelTrick = () => {
    gameRef.value.tricks = gameRef.value.tricks
      .sort((a, b) => b.idx - a.idx)
      .slice(0, -1);
    triggerRef(gameRef);
    updateGame(gameRef.value);
  };

  const moveCursor = async () => {
    const game = toRaw(gameRef.value);
    if (game.championer !== undefined) return;
    isAsking.value = true;
    // 获取下一个人的出牌
    const trick = await askTrick(game);
    isAsking.value = false;
    handleTrick(trick);
    if (gameRef.value.autoStart === true) moveCursor();
  };

  const handleTrick = (trick: Trick) => {
    const game = toRaw(gameRef.value);
    const needHandleTrick = getNeedHandleTrick(game);
    try {
      const t = check(game, trick);
      if (needHandleTrick === undefined) {
        game.tricks.push({ idx: game.tricks.length, tricks: [t] });
      } else getGameLastTricks(game)?.push(trick);
      broadcast(game, t);
      if (checkGameFinish(game, trick.player)) {
        game.championer = trick.player;
      }
      gameRef.value = game;
      triggerRef(gameRef);
      updateGame(game);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  start();
  return {
    trashTricks,
    cancelTrick,
    isAsking,
    gameRef,
    toggle,
    moveCursor,
    manualPlay,
  };
};

export const useGame = (game: Game) => {
  const cacheRes = __useGameCache[game.id];
  if (cacheRes) return cacheRes;
  const res = __useGame(game);
  __useGameCache[game.id] = res;
  return res;
};
