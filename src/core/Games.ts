import localforage from "localforage";
import { ref } from "vue";
import { Game } from "./model";
import Queue from "p-queue";

const db = localforage.createInstance({
  driver: localforage.LOCALSTORAGE,
  name: "games",
  storeName: "games",
});

const games = ref<Game[]>([]);
const queues: { [key: string]: Queue } = {};

export const useGames = () => {
  const refreshGames = async () => {
    const keys = await db.keys();
    const dbPlayers = await Promise.all(keys.map((k) => db.getItem<Game>(k)));
    games.value = dbPlayers as any;
    games.value
      .filter((p) => !Object.keys(queues).includes(p.id))
      .forEach((p) => (queues[p.id] = new Queue({ concurrency: 1 })));
  };

  const addGames = async (games: Game[]) => {
    await Promise.all(games.map((g) => db.setItem(g.id, g)));
    refreshGames();
  };

  const delGame = async (game: Game) => {
    await db.removeItem(game.id);
    delete queues[game.id];
    refreshGames();
  };

  const exec = (game: Game, func: () => Promise<unknown>) => {
    queues[game.id]?.add(func);
    queues[game.id]?.start();
  };

  const updateGame = async (game: Game) => {
    await exec(
      game,
      async () => await db.setItem(game.id, JSON.parse(JSON.stringify(game)))
    );
    refreshGames();
  };

  refreshGames();

  return {
    games,
    addGames,
    delGame,
    updateGame,
  };
};
