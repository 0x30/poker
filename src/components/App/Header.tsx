import { defineComponent } from "@vue/runtime-core";

import { usePlayers } from "../../core/Player";
import { useGameAlert } from "../modal/Game";

import { useGames } from "../../core/Games";
import { usePlayerAlert } from "../modal/Player";
import { useTrophyAlert } from "../modal/Trophy";

export default defineComponent(() => {
  const { addPlayer } = usePlayers();
  const { addGames } = useGames();

  const clickAddTrophy = async () => {
    const games = await useTrophyAlert();
    addGames(games);
  };

  const clickAddPlayer = async () => {
    const player = await usePlayerAlert();
    addPlayer(player);
  };

  const clickAddGame = async () => {
    const games = await useGameAlert();
    addGames(games);
  };

  return () => {
    return (
      <div class="navbar fixed top-0 right-0 left-0 lg:top-5 lg:right-5 lg:left-5 bg-neutral text-neutral-content lg:rounded-box z-50">
        <div class="flex-1 px-2 mx-2">
          <span class="text-lg font-bold">跑得快</span>
        </div>
        <div>
          <button
            data-tip="开始比赛"
            class="btn btn-square btn-ghost tooltip flex items-center"
            onClick={clickAddTrophy}
          >
            <i class="gg-trophy"></i>
          </button>
        </div>
        <div>
          <button
            data-tip="增加用户"
            class="btn btn-square btn-ghost tooltip flex items-center"
            onClick={clickAddPlayer}
          >
            <i class="gg-user-add"></i>
          </button>
        </div>
        <div>
          <button
            data-tip="开局游戏"
            class="tooltip btn btn-square btn-ghost flex items-center"
            onClick={clickAddGame}
          >
            <i class="gg-games"></i>
          </button>
        </div>
        <div>
          <a
            href="./rule.html"
            target="_blank"
            data-tip="规则说明"
            class="tooltip btn btn-square btn-ghost flex items-center"
          >
            <i class="gg-info"></i>
          </a>
        </div>
      </div>
    );
  };
});
