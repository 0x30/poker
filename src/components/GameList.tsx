import { computed, defineComponent, PropType, ref, unref } from "vue";
import { useGames } from "../core/Games";
import { useGame } from "../core/Game";

import { Card, currentPlayer, Game, GamePlayer, Player } from "../core/model";
import Class from "../style/GameItem.module.scss";
import { getCurrentCardsPool } from "../core/Referee";

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
            <span>{props.player.nikeName?.slice(0, 1)}</span>
          </div>
          <span class="absolute left-1/2 top-full transform -translate-x-1/2">
            {props.player.leftCards.length}
          </span>
        </div>
      );
    };
  },
});

const GameMenu = defineComponent({
  props: {
    isPlaying: Boolean,
    isFinish: Boolean,
    onToggle: Function as PropType<() => void>,
    onGoDetail: Function as PropType<() => void>,
    onNext: Function as PropType<() => void>,
  },
  setup: (props) => {
    return () => {
      return (
        <div class="btn-group">
          {props.isFinish === false ? (
            <button
              class={`btn btn-outline btn-sm ${
                props.isPlaying ? "btn-active" : ""
              }`}
              onClick={props.onToggle}
            >
              {props.isPlaying ? (
                <i class="gg-play-pause transform "></i>
              ) : (
                <i class="gg-play-button transform "></i>
              )}
            </button>
          ) : null}

          {props.isPlaying === false || props.isFinish ? (
            <button class="btn btn-outline btn-sm" onClick={props.onGoDetail}>
              <i class="gg-eye transform "></i>
            </button>
          ) : null}
          {props.isFinish || props.isPlaying ? null : (
            <>
              <button
                class="btn btn-outline btn-sm px-5"
                onClick={props.onNext}
              >
                <i class="gg-play-track-next transform "></i>
              </button>
            </>
          )}
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
                <div class="stat-value text-base">
                  {props.isPlaying ? "自动" : "手动"}
                </div>
              </div>
              <div class="stat place-items-center place-content-center">
                <div class="stat-title text-xs font-semibold">当前回合</div>
                <div class="stat-value text-base">{props.tricks}</div>
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
    const statusRef = ref("#2094f3");

    const { gameRef, moveCursor, isPlaying, toggle } = useGame(
      unref(props.game)
    );

    const splayers = computed<
      (GamePlayer & {
        currentPlayer: boolean;
        leftCards: Card[];
      })[]
    >(() => {
      const cp = currentPlayer(gameRef.value);
      return gameRef.value.players.map((p) => {
        return {
          ...p,
          ...{
            currentPlayer: cp.id === p.id,
            leftCards: getCurrentCardsPool(gameRef.value, p),
          },
        };
      });
    });

    return () => {
      const leftCardNum = splayers.value.reduce(
        (t, s) => s.leftCards.length + t,
        0
      );

      const isFinish = gameRef.value.championer !== undefined;

      return (
        <div class="card bg-base-100 shadow-lg px-4 py-4 grid items-center justify-items-center">
          <GameStat
            leftCardNum={leftCardNum}
            isPlaying={isPlaying.value}
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
                fill={statusRef.value}
                stroke="none"
                d="M34.339745962156 9.6987298107781a10 10 0 0 1 17.320508075689 0l32.679491924311 56.602540378444a10 10 0 0 1 -8.6602540378444 15l-65.358983848622 0a10 10 0 0 1 -8.6602540378444 -15"
              ></path>
            </svg>
          </div>
          <GameMenu
            isFinish={isFinish}
            isPlaying={isPlaying.value}
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
