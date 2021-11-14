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

  const addCount = async (
    player: Player,
    paramNamme: "joinCount" | "victoryCount"
  ) => {
    const p = await db.getItem<Player>(player.id);
    if (p) {
      const result = { ...p, ...{ [paramNamme]: (p[paramNamme] ?? 0) + 1 } };
      await db.setItem(player.id, result);
      refreshPlayers();
    }
  };

  const exec = (player: Player, func: () => Promise<unknown>) => {
    queues[player.id]?.add(func);
    queues[player.id]?.start();
  };

  const addJoinCount = (player: Player) =>
    exec(player, () => addCount(player, "joinCount"));
  const addVictoryCount = (player: Player) =>
    exec(player, () => addCount(player, "victoryCount"));

  refreshPlayers();

  return {
    players,
    addPlayer,
    delPlayer,
    addJoinCount,
    addVictoryCount,
  };
};

export const playerName = (player: Player) => {
  return player.nikeName ?? "无名之辈";
};

export const playerNameCode = (player: Player) => {
  return playerName(player).slice(0, 1);
};
