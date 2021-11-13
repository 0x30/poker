import { computed, ref } from "vue";
import localforage, { key } from "localforage";
import Queue from "p-queue";
import { generateId } from "./util";

export class Player {
  // 唯一标识
  id: string;

  // 昵称
  nikeName?: string;
  // 主机地址
  host: string;

  // 加入次数
  joinCount: number;
  // 胜利次数
  victoryCount: number;

  // 创建时间
  createTime: number;

  constructor(host: string, nikeName?: string) {
    this.id = generateId();
    this.nikeName = nikeName;
    this.joinCount = 0;
    this.victoryCount = 0;
    this.host = host;
    this.createTime = new Date().getTime();
  }
}

export const createPlayer = () => {};

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
