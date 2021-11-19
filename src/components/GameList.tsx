import { defineComponent, onMounted, PropType, unref } from "vue";
import { useGames } from "../core/Games";
import { useGame } from "../core/Game";

import { Game, isWoodMan } from "../core/model";

import { useDeskDrawer } from "../components/modal/Desk";
import { GameMenuStyle2 as GameMenu } from "./GameMenu";

const GameItem = defineComponent({
  props: {
    game: {
      type: Object as PropType<Game>,
      required: true,
    },
  },
  setup: (props) => {
    const { gameRef, moveCursor, toggle, isAsking } = useGame(
      unref(props.game)
    );

    return () => {
      const isFinish = gameRef.value.championer !== undefined;

      return (
        <div class="card shadow-lg compact side bg-base-100">
          <div class="flex-row items-center space-x-4 card-body">
            <div class="flex-1">
              {isFinish ? (
                <h2 class="card-title text-neutral">完成</h2>
              ) : (
                <h2 class="card-title text-info">进行中</h2>
              )}
              <p class="text-base-content text-opacity-40 font-mono">
                {gameRef.value.id}
              </p>
              <p>
                {gameRef.value.players
                  .filter((r) => !isWoodMan(r))
                  .map((r) => r.nikeName)
                  .join(",")}
                <span class="text-red-400">
                  胜利者:{gameRef.value.championer?.nikeName}
                </span>
              </p>
            </div>
            <div class="flex space-x-2 flex-0">
              <GameMenu
                onGoDetail={() => useDeskDrawer(gameRef.value)}
                isAsking={isAsking.value}
                isFinish={isFinish}
                isPlaying={gameRef.value.autoStart}
                onToggle={toggle}
                onNext={moveCursor}
              />
            </div>
          </div>
        </div>
      );
    };
  },
});

export default defineComponent(() => {
  const { games } = useGames();
  return () => {
    return (
      <div class="grid grid-rows-1 grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8 py-4">
        {games.value.map((g) => (
          <GameItem game={g} key={g.id} />
        ))}
      </div>
    );
  };
});
