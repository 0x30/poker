import { defineComponent, PropType, ref, unref } from "vue";
import { useGame, useGames } from "../core/Game";
import { Game, GamePlayer } from "../core/model";
import Class from "../style/GameItem.module.scss";

const RankIcon = defineComponent(() => {
  return () => {
    return (
      <div class={Class.rank}>
        <div class={Class.rank11}></div>
      </div>
    );
  };
});

const AvatarComp = defineComponent({
  props: {
    player: {
      required: true,
      type: Object as PropType<GamePlayer>,
    },
  },
  setup: (props) => {
    return () => {
      const isCurrent = props.player.current;
      return (
        <div class={`avatar placeholder ${isCurrent ? "animate-pulse" : ""}`}>
          <div
            class={`${
              isCurrent ? "bg-success" : "bg-neutral-focus"
            } text-neutral-content rounded-full w-10 h-10`}
          >
            <span>{props.player.nikeName?.slice(0, 1)}</span>
          </div>
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

    const { game, changeNextUser } = useGame(unref(props.game));

    return () => {
      return (
        <div
          class="card bg-base-100 shadow-lg px-4 py-4 grid items-center justify-items-center"
          onClick={changeNextUser}
        >
          {game.players.map((p) => `${p.current}`)}
          <div class={Class.item}>
            <AvatarComp player={game.players[0]} />
            <AvatarComp player={game.players[1]} />
            <AvatarComp player={game.players[2]} />
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
        </div>
      );
    };
  },
});

export default defineComponent(() => {
  const { games } = useGames();

  return () => {
    return (
      <div class="grid grid-rows-1 grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
        {games.value.map((g) => (
          <GameItem game={g} />
        ))}
      </div>
    );
  };
});
