import { ref } from "vue";
import localforage from "localforage";
import Queue from "p-queue";
import {
  Player,
  WoodmanPlayer,
  RobotPlayer,
  Robot2Player,
  isNpc,
  Robot3Player,
} from "./model";

const db = localforage.createInstance({
  name: "plyers",
  storeName: "players",
});

const players = ref<Player[]>([]);
const queues: { [key: string]: Queue } = {};

export const equal = (player?: Player, player2?: Player) => {
  return player?.id === player2?.id;
};

export const getPlayers = async () => {
  const keys = await db.keys();
  return await Promise.all(
    keys.map((k) => db.getItem<Player>(k) as any as Player)
  );
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

  const joinNpc = async () => {
    const keys = await db.keys();
    var needR = false;
    for await (const player of [
      WoodmanPlayer,
      RobotPlayer,
      Robot2Player,
      Robot3Player,
    ]) {
      if (!keys.includes(player.id)) {
        needR = true;
        await db.setItem(player.id, player);
      }
    }
    if (needR) refreshPlayers();
  };

  refreshPlayers();
  joinNpc();

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
  return isNpc(player) ? player.nikeName : playerName(player).slice(0, 1);
};
