import { computed, defineComponent, onMounted, PropType, unref } from "vue";
import { useGames } from "../core/Games";
import { getGamePlayers, useGame } from "../core/Game";

import { Card, Game, GamePlayer, Player } from "../core/model";
import Class from "../style/GameItem.module.scss";

import { useDeskDrawer } from "../components/modal/Desk";
import { GameMenuStyle2 as GameMenu } from "./GameMenu";
import { playerNameCode } from "../core/Player";

const AvatarComp = defineComponent({
  props: {
    isFinish: Boolean,
    player: {
      required: true,
      type: Object as PropType<
        GamePlayer & {
          currentPlayer: boolean;
          leftCards: Card[];
        }
      >,
    },
  },
  setup: (props) => {
    return () => {
      const isCurrent = props.player.currentPlayer && props.isFinish === false;
      return (
        <div
          class={`avatar placeholder relative ${
            isCurrent ? "animate-pulse" : ""
          }`}
        >
          <div
            class={`${
              isCurrent ? "bg-success" : "bg-neutral-focus"
            } text-neutral-content rounded-full w-10 h-10`}
          >
            <span>{playerNameCode(props.player)}</span>
          </div>
          <span class="absolute left-1/2 top-full transform -translate-x-1/2">
            {props.player.leftCards.length}
          </span>
        </div>
      );
    };
  },
});

const GameStat = defineComponent({
  props: {
    leftCardNum: Number,
    tricks: Number,
    championer: Object as PropType<Player>,
    isPlaying: Boolean,
  },
  setup: (props) => {
    return () => {
      return (
        <div class="w-full shadow stats">
          {props.championer ? (
            <>
              <div class="stat place-items-center place-content-center">
                <div class="stat-title text-xs font-semibold">状态</div>
                <div class="stat-value text-base">结束</div>
              </div>
              <div class="stat place-items-center place-content-center">
                <div class="stat-title text-xs font-semibold">胜利者</div>
                <div class="stat-value text-base">
                  {props.championer.nikeName}
                </div>
              </div>
              <div class="stat place-items-center place-content-center">
                <div class="stat-title text-xs font-semibold">共进行回合</div>
                <div class="stat-value text-base">{props.tricks}</div>
              </div>
            </>
          ) : (
            <>
              <div class="stat place-items-center place-content-center">
                <div class="stat-title text-xs font-semibold">状态</div>
                <div class="stat-value text-base text-success">
                  {props.isPlaying ? "自动" : "手动"}
                </div>
              </div>
              <div class="stat place-items-center place-content-center">
                <div class="stat-title text-xs font-semibold">当前回合</div>
                <div class="stat-value text-base text-success">
                  {props.tricks}
                </div>
              </div>
              <div class="stat place-items-center place-content-center">
                <div class="stat-title text-xs font-semibold">剩余卡牌</div>
                <div class="stat-value text-base text-success">
                  {props.leftCardNum}
                </div>
              </div>
            </>
          )}
        </div>
      );
    };
  },
});

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

    onMounted(() => useGame(gameRef.value));

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
