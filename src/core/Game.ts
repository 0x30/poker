import { ref, toRaw, triggerRef } from "vue";
import { debugCard, emojiCards, equal, firstCard, hasFirstCard } from "./Card";
import { useGames } from "./Games";
import { Card, Game, isWoodMan, Player, Trick } from "./model";
import { detect, duel } from "./Referee";

import { askTrick } from "./req";

export const getGameLastTricks = (game: Game): Trick[] | undefined => {
  return game.tricks
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
    if (trick.cards === undefined) {
      throw new Error("流程错误,本次必须出牌");
    }

    if (game.tricks.length === 0 && hasFirstCard(trick.cards) === false) {
      console.log("======================================");
      console.log(`%c${emojiCards(trick.cards)}`, "font-size: 100px");
      throw new Error(`牌型错误,首次出牌中必须包含${debugCard(firstCard)}`);
    }
  }

  /// pass
  if (trick.cards === undefined) return trick;
  /// 牌型判断
  if (detect(trick.cards) === undefined) {
    console.log("======================================");
    console.log(`%c${emojiCards(trick.cards)}`, "font-size: 100px");
    throw new Error("出牌规则错误");
  }

  if (new Set(trick.cards.map(debugCard)).size !== trick.cards.length) {
    console.log("======================================");
    console.log(`%c${emojiCards(trick.cards)}`, "font-size: 100px");
    throw new Error("你出得牌不太对劲");
  }

  /// 确认 出得牌 是否都在当前牌库内
  const currentCardPolls = getCurrentCardsPool(game, trick.player);
  if (
    trick.cards.every(
      (c) => currentCardPolls.find((cc) => equal(cc, c)) !== undefined
    ) === false
  ) {
    console.log("======================================");
    console.log(
      `剩余卡池: %c${emojiCards(currentCardPolls)}`,
      "font-size: 100px"
    );
    console.log(`当前卡组: %c${emojiCards(trick.cards)}`, "font-size: 100px");
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
  console.log("======================================");
  console.log(
    `对手卡组: %c${emojiCards(needHandleTrick.cards)}`,
    "font-size: 100px"
  );
  console.log(`当前卡组: %c${emojiCards(trick.cards)}`, "font-size: 100px");
  throw new Error("出得牌不太对劲，不是打不错，就是类型大太搭");
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
  const players = game.players.sort((a, b) => a.createTime - b.createTime);

  // 当前没有回合.默认获取 黑桃三 的拥有者作为当前用户
  if (game.tricks.length === 0) {
    return players.find((p) => hasFirstCard(p.cards))!;
  }
  if (getNeedHandleTrick(game) === undefined) {
    const pid = getGameLastTricks(game)?.slice(2, 3)[0].player.id;
    return players.find((p) => p.id === pid)!;
  }
  const lastPlayer = getGameLastTricks(game)?.[0].player;
  const li = players.findIndex((p) => p.id === lastPlayer?.id);
  return players[(li + 2) % 3];
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

const __useGame = (game: Game) => {
  const gameRef = ref(game);

  const { updateGame } = useGames();

  const isAsking = ref(false);

  const toggle = () => {
    game.autoStart = !game.autoStart;
    if (game.autoStart === true) moveCursor();
    updateGame(game);
  };

  const start = async () => {
    if (game.championer !== undefined) return;
    if (game.autoStart === true) moveCursor();
  };

  const manualPlay = (player: Player, cards?: Card[]) => {
    const trick = new Trick(player, cards);
    handleTrick(trick);
  };

  const trashTricks = () => {
    game.championer = undefined;
    game.tricks = [];
    game.autoStart = false;
    triggerRef(gameRef);
    updateGame(game);
  };

  const cancelTrick = () => {
    const nGame: Game = JSON.parse(JSON.stringify(gameRef.value));
    const tricks = getGameLastTricks(nGame);
    const res = tricks?.shift();
    if (res?.player && isWoodMan(res.player)) {
      tricks?.shift();
    }
    nGame.tricks = nGame.tricks.filter((t) => t.tricks.length > 0);
    gameRef.value = nGame;
    triggerRef(gameRef);
    updateGame(nGame);
  };

  const moveCursor = async () => {
    if (game.championer !== undefined) return;

    // 获取下一个人的出牌
    try {
      isAsking.value = true;
      const trick = await askTrick(game);
      isAsking.value = false;
      handleTrick(trick);
      if (game.autoStart === true) moveCursor();
    } catch (error) {
      isAsking.value = false;
    }
  };

  const handleTrick = (trick: Trick) => {
    const needHandleTrick = getNeedHandleTrick(game);
    try {
      const t = check(game, trick);
      if (needHandleTrick === undefined) {
        t.createTime = 0;
        game.tricks.push({ idx: game.tricks.length, tricks: [t] });
      } else {
        const res = getGameLastTricks(game);
        trick.createTime = (res?.length ?? 0) + 1;
        res?.push(trick);
      }
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
