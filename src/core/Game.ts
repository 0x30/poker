import { Ref, ref, toRaw, triggerRef } from "vue";
import { useGames } from "./Games";
import { Game, GamePlayer, getNeedHandleTrick, lastTricks } from "./model";
import { check, isGameFinish } from "./Referee";

import { askTrick, deal } from "./req";

const _pool: { [key: string]: Ref<Game> } = {};
const getGameRef = (game: Game) => {
  const res = _pool[game.id];
  if (res) return res;
  const nres = ref(game);
  _pool[game.id] = nres;
  return nres;
};

export const useGame = (g: Game) => {
  const gameRef = getGameRef(g);
  const { updateGame } = useGames();

  const isPlaying = ref(gameRef.value.autoStart);

  const toggle = () => {
    isPlaying.value = !isPlaying.value;
    if (isPlaying.value === true) moveCursor();
  };

  const start = async () => {
    if (gameRef.value.championer !== undefined) return;
    await deal(gameRef.value);
    if (isPlaying.value === true) moveCursor();
  };

  const moveCursor = async () => {
    const game = toRaw(gameRef.value);
    if (game.championer !== undefined) return;
    // 获取下一个人的出牌
    const trick = await askTrick(game);
    const needHandleTrick = getNeedHandleTrick(game);
    const t = check(game, trick);
    if (needHandleTrick === undefined) {
      game.tricks.push({ idx: game.tricks.length, tricks: [t] });
    } else lastTricks(game)?.push(trick);

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
