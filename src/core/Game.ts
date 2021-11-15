import { reactive, ref, toRaw, triggerRef } from "vue";
import { debugCards } from "./Card";
import { useGames } from "./Games";
import { Game, GamePlayer, getNeedHandleTrick, lastTricks } from "./model";
import { check, isGameFinish } from "./Referee";

import { askTrick, deal } from "./req";

export const useGame = (g: Game) => {
  const gameRef = ref(g);
  const { updateGame } = useGames();

  const isPlaying = ref(gameRef.value.autoStart);

  const toggle = () => {
    console.log("???我日？？");

    isPlaying.value = !isPlaying.value;
  };
  const start = async () => {
    if (gameRef.value.championer !== undefined) return;
    await deal(gameRef.value);
    if (isPlaying.value === true) moveCursor();
  };

  const moveCursor = async () => {

    console.log("???what 警告");
    

    const game = toRaw(gameRef.value);
    if (game.championer !== undefined) return;
    // 获取下一个人的出牌
    const trick = await askTrick(game);
    const needHandleTrick = getNeedHandleTrick(game);
    const t = check(game, trick);
    if (needHandleTrick === undefined) {
      game.tricks.push({ idx: game.tricks.length, tricks: [t] });
    } else {
      lastTricks(game)?.push(trick);
    }
    if (isGameFinish(game, trick.player)) game.championer = trick.player;
    gameRef.value = game;
    triggerRef(gameRef);
    updateGame(game);
    if (isPlaying.value === true) moveCursor();
  };
  start();
  return {
    gameRef,
    isPlaying,
    toggle,
    moveCursor,
  };
};
