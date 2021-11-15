import { reactive, ref, toRaw } from "vue";
import { debugCards } from "./Card";
import { useGames } from "./Games";
import { Game, GamePlayer, getNeedHandleTrick, lastTricks } from "./model";
import { check, isGameFinish } from "./Referee";

import { askTrick, deal } from "./req";

export const useGame = (g: Game) => {
  const gameRef = ref(g);
  const { updateGame } = useGames();

  // const start = async () => {
  //   if (game.isFinished) return;
  //   await deal(game);
  //   moveCursor();
  // };

  const moveCursor = async () => {
    const game = toRaw(gameRef.value);

    // 获取下一个人的出牌
    const trick = await askTrick(game);
    const needHandleTrick = getNeedHandleTrick(game);
    const t = check(game, trick);
    console.log("实际出: ", debugCards(t.cards));
    if (needHandleTrick === undefined) {
      game.tricks.push({ idx: game.tricks.length, tricks: [t] });
    } else {
      lastTricks(game)?.push(trick);
    }

    if (isGameFinish(game, trick.player)) {
      game.isFinished = true;
      console.log("游戏结束:", trick.player.nikeName, "获胜");
    }

    gameRef.value = game;
    updateGame(game);
  };

  // start();

  return {
    gameRef,
    moveCursor,
  };
};
