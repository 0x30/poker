import localforage from "localforage";
import { computed, ref } from "vue";
import { Card, getRunFastCards } from "./Card";
import { Player } from "./Player";
import Queue from "p-queue";
import { generateId } from "./util";

class Round {
  index: number;
  starter: Player;
}

export class Game {
  id: string;
  players: GamePlayer[];
  /// 回合数
  // rounds: Round[] = [];

  constructor(players: GamePlayer[]) {
    this.id = generateId();
    this.players = players;
  }
}

export interface GamePlayer extends Player {
  cards: Card[];
}

export const useGame = (players: Player[]) => {
  const cards = getRunFastCards();
  const p = players.map<GamePlayer>((v, i) => ({
    ...v,
    ...{ cards: cards[i] },
  }));
  const game = new Game(p);

  const start = () => {};

  return {};
};

const db = localforage.createInstance({
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

  const addGame = async (game: Game) => {
    console.log("新增游戏", game);

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
    exec(game, async () => {
      await db.setItem(game.id, game);
    });
  };

  refreshGames();

  return {
    games,
    addGame,
    delGame,
    updateGame,
  };
};
