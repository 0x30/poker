import localforage from "localforage";
import { computed, reactive, ref, toRaw, toRef, toRefs, unref } from "vue";
import { getRunFastCards, isHeaderThree } from "./Card";
import { Card, Player, Game, GamePlayer } from "./model";
import Queue from "p-queue";
import { generateId } from "./util";
import { detectType } from "./Referee";

const db = localforage.createInstance({
  name: "games",
  storeName: "games",
});

const games = ref<Game[]>([]);
const queues: { [key: string]: Queue } = {};


detectType([])

export const useGames = () => {
  const refreshGames = async () => {
    const keys = await db.keys();
    const dbPlayers = await Promise.all(keys.map((k) => db.getItem<Game>(k)));
    games.value = dbPlayers as any;
    games.value
      .filter((p) => !Object.keys(queues).includes(p.id))
      .forEach((p) => (queues[p.id] = new Queue({ concurrency: 1 })));
  };

  const addGame = async (game: Game) => {
    await db.setItem(game.id, game);
    refreshGames();
  };

  const delGame = async (player: Player) => {
    await db.removeItem(player.id);
    delete queues[player.id];
    refreshGames();
  };

  const exec = (game: Game, func: () => Promise<unknown>) => {
    queues[game.id]?.add(func);
    queues[game.id]?.start();
  };

  const updateGame = (game: Game) => {
    exec(game, async () => await db.setItem(game.id, game));
  };

  refreshGames();

  return {
    games,
    addGame,
    delGame,
    updateGame,
  };
};

export const useGame = (g: Game) => {
  const game = reactive(g);
  const { updateGame } = useGames();

  const start = () => {
    if (game.isFinished) return;
    changeCurrentPlayer(currentPlayer());
  };

  const currentPlayer = () => {
    const currentPlayer = getCurrentPlayer();
    if (currentPlayer) return currentPlayer;
    return getHeart3Player()!;
  };

  const getCurrentPlayer = () => game.players[getCurrentPlayerIndex()];
  const getCurrentPlayerIndex = () => game.players.findIndex((p) => p.current);
  const getHeart3Player = () =>
    game.players.find(
      (p) => p.cards.find((c) => isHeaderThree(c)) !== undefined
    );

  const changeCurrentPlayer = (player: GamePlayer) => {
    game.players.forEach((p) => {
      if (p.id === player.id) p.current = true;
      else p.current = false;
    });

    updateGame(toRaw(game));
  };

  const getNextPlayer = () => {
    const index = game.players.findIndex((p) => p.id === currentPlayer().id);
    return game.players[(index + 2) % 3];
  };

  const changeNextUser = () => {
    changeCurrentPlayer(getNextPlayer());
  };

  start();

  return {
    game,
    changeNextUser,
  };
};
