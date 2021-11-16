import { ref } from "vue";
import localforage from "localforage";
import Queue from "p-queue";
import { Player } from "./model";

const db = localforage.createInstance({
  name: "plyers",
  storeName: "players",
});

const players = ref<Player[]>([]);
const queues: { [key: string]: Queue } = {};

export const equal = (player?: Player, player2?: Player) => {
  return player?.id === player2?.id;
};

export const usePlayers = () => {
  const refreshPlayers = async () => {
    const keys = await db.keys();
    const dbPlayers = await Promise.all(keys.map((k) => db.getItem<Player>(k)));
    players.value = dbPlayers as any;
    players.value
      .filter((p) => !Object.keys(queues).includes(p.id))
      .forEach((p) => (queues[p.id] = new Queue({ concurrency: 1 })));
  };

  const addPlayer = async (player: Player) => {
    await db.setItem(player.id, player);
    refreshPlayers();
  };

  const delPlayer = async (player: Player) => {
    await db.removeItem(player.id);
    delete queues[player.id];
    refreshPlayers();
  };

  refreshPlayers();

  return {
    players,
    addPlayer,
    delPlayer,
  };
};

export const playerName = (player: Player) => {
  return player.nikeName ?? "无名之辈";
};

export const playerNameCode = (player: Player) => {
  return playerName(player).slice(0, 1);
};
