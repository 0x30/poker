import "../style/index.scss";
import { createApp, defineComponent, ref } from "vue";

import { Game } from "../core/model";
import { askTrick } from "../core/req";
import {
  check,
  checkGameFinish,
  getGameLastTricks,
  getNeedHandleTrick,
} from "../core/Game";

import { ProgressChart, ProgressMode, Table, ChartCompent } from "./comp";
import { getPlayers, usePlayers } from "../core/Player";
import { getPermutations } from "../core/util";
import { newVersionsplitCards } from "../core/Card";

interface PlayerGameInfo {
  joinCount: number;
  winCount: number;
  firstWinCount: number;
}

export const useGames = () => {
  const gameMap = new Map<string, Game>();
  const finishGameMap = new Map<string, Game>();

  const players = ref<{ [key: string]: PlayerGameInfo }>({});

  const addGames = async () => {
    const players = await getPlayers();

    const permutationPlayers = getPermutations(players, 3);

    const result = permutationPlayers.flatMap((ps) => {
      const res = new Array(1).fill("").flatMap(() => {
        return newVersionsplitCards(ps);
      });
      return res;
    });
    const games = result.map((r) => {
      const game = new Game(r, true);
      game.__isOnline = true;
      return game;
    });

    games.forEach((g) => gameMap.set(g.id, g));
    start();
  };

  const finishGame = (game: Game) => {
    gameMap.delete(game.id);
    finishGameMap.set(game.id, game);

    for (const [, val] of finishGameMap) {
      if (val.championer?.nikeName) {
        const value = players.value[val.championer.nikeName] ?? {
          joinCount: 0,
          winCount: 0,
          firstWinCount: 0,
        };
        players.value[val.championer.nikeName] = {
          joinCount: value.joinCount + 1,
          winCount: value.winCount + 1,
          firstWinCount: value.firstWinCount + 1,
        };
      }
    }
  };

  const start = () => {
    const games = getGames(10);
    if (games.length <= 0) return;
    Promise.all(games.map((g) => startGame(g).then(finishGame))).then(start);
  };

  const getGames = (batch: number) => {
    const games: Game[] = [];
    const gameInterable = gameMap.entries();
    for (let index = 0; index < batch; index++) {
      const { value, done } = gameInterable.next();
      if (done === true) return games;
      if (value) games.push(value[1]);
    }
    return games;
  };

  const startGame = async (game: Game): Promise<Game> => {
    const trick = await askTrick(game);
    const needHandleTrick = getNeedHandleTrick(game);
    if (needHandleTrick === undefined) {
      game.tricks.push({
        idx: game.tricks.length,
        tricks: [check(game, trick)],
      });
    } else {
      getGameLastTricks(game)?.push(trick);
    }
    if (checkGameFinish(game, trick.player)) return game;
    return await startGame(game);
  };

  start();

  return {
    addGames,
  };
};

const App = defineComponent(() => {
  const testData = ref({ a: 100, b: 200 });

  const { addGames } = useGames();

  return () => {
    return (
      <div class="grid grid-cols-5 p-4 gap-4">
        <div class="flex flex-col space-y-4 justify-between">
          <ProgressChart
            title="当前正在进行的对局"
            color={ProgressMode.primary}
            progress={30}
          />
          <ProgressChart
            title="当前声誉"
            color={ProgressMode.primary}
            progress={30}
          />
          <ProgressChart
            title="当前正在进行的对局"
            color={ProgressMode.primary}
            progress={30}
          />
        </div>

        <div
          class="card shadow-lg compact side bg-base-100 p-4"
          onClick={() => addGames()}
        >
          <ChartCompent data={testData.value} />
        </div>

        <div class="card shadow-lg compact side bg-base-100 col-span-5 p-4">
          <div class="overflow-x-auto">
            <Table
              ktMap={{ a: "你好", b: "你好", c: "你好", d: "你好" }}
              datas={[
                { a: 1, b: 2, c: 3, d: 4 },
                { a: 1, b: 2, c: 3, d: 4 },
                { a: 1, b: 2, c: 3, d: 4 },
                { a: 1, b: 2, c: 3, d: 4 },
                { a: 1, b: 2, c: 3, d: 4 },
                { a: 1, b: 2, c: 3, d: 4 },
                { a: 1, b: 2, c: 3, d: 4 },
              ]}
            />
          </div>
        </div>
      </div>
    );
  };
});

createApp(App).mount("#app");
