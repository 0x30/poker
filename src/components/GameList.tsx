import { computed, defineComponent, PropType, ref, unref } from "vue";
import { useGames } from "../core/Games";
import { getGamePlayers, useGame } from "../core/Game";

import { Card, Game, GamePlayer, Player } from "../core/model";
import Class from "../style/GameItem.module.scss";

import { useDeskDrawer } from "../components/modal/Desk";
import { GameMenu } from "./GameMenu";
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

    const splayers = computed(() => getGamePlayers(gameRef.value));

    return () => {
      const isFinish = gameRef.value.championer !== undefined;
      const leftCardNum = splayers.value.reduce(
        (t, s) => s.leftCards.length + t,
        0
      );
      const deskColor = isFinish ? "#2094f3" : "#009485";

      return (
        <div class="card bg-base-100 shadow-lg px-4 py-4 grid items-center justify-items-center">
          <GameStat
            leftCardNum={leftCardNum}
            isPlaying={gameRef.value.autoStart}
            tricks={gameRef.value.tricks.length}
            championer={gameRef.value.championer}
          />
          <div class={Class.item}>
            {splayers.value.map((s) => (
              <AvatarComp isFinish={isFinish} player={s} key={s.id} />
            ))}
            <svg
              class={Class.desk}
              xmlns="http://www.w3.org/2000/svg"
              width="86"
              height="86"
            >
              <path
                fill={deskColor}
                stroke="none"
                d="M34.339745962156 9.6987298107781a10 10 0 0 1 17.320508075689 0l32.679491924311 56.602540378444a10 10 0 0 1 -8.6602540378444 15l-65.358983848622 0a10 10 0 0 1 -8.6602540378444 -15"
              ></path>
            </svg>
          </div>
          <GameMenu
            onGoDetail={() => useDeskDrawer(gameRef.value)}
            isAsking={isAsking.value}
            isFinish={isFinish}
            isPlaying={gameRef.value.autoStart}
            onToggle={toggle}
            onNext={moveCursor}
          />
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
