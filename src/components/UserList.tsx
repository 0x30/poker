import { computed, defineComponent, PropType } from "vue";
import { equal, playerNameCode, usePlayers } from "../core/Player";
import { isNpc, isRobot, isWoodMan, Player } from "../core/model";
import { useGames } from "../core/Games";

const UserCard = defineComponent({
  props: {
    player: {
      required: true,
      type: Object as PropType<Player>,
    },
  },
  setup: (props) => {
    const { games } = useGames();

    const joinCount = computed(
      () =>
        games.value.filter(
          (g) => g.players.find((p) => equal(p, props.player)) !== undefined
        ).length
    );

    const victoryCount = computed(
      () => games.value.filter((g) => equal(g.championer, props.player)).length
    );

    return () => {
      return (
        <div class="card shadow-lg compact side bg-base-100 px-4 py-3">
          <div class="flex flex-col">
            <div class="flex mb-3 content-between justify-between">
              <div class="flex flex-col items-center">
                <span class="text-xs text-gray-500">参与对战</span>
                <span class="text-sm font-mono font-black">
                  {joinCount.value}
                </span>
              </div>
              <div class="avatar placeholder">
                <div class="bg-neutral-focus text-neutral-content rounded-full w-10 h-10">
                  <span>{playerNameCode(props.player)}</span>
                </div>
              </div>
              <div class="flex flex-col items-center">
                <span class="text-xs text-gray-500">获得胜利</span>
                <span class="text-sm font-mono font-black">
                  {victoryCount.value}
                </span>
              </div>
            </div>
            <div class="flex flex-col items-center">
              <span class="text-neutral-focus text-base font-black">
                {props.player.nikeName ?? "无名之辈"}
              </span>
              <span class="text-xs text-gray-500 font-serif">
                {props.player.host}
              </span>
            </div>
          </div>
        </div>
      );
    };
  },
});

export default defineComponent({
  setup: () => {
    const { players } = usePlayers();
    return () => {
      return (
        <div class="grid grid-rows-1 grid-cols-1 lg:grid-cols-2 xl:grid-cols-6 gap-3">
          {players.value
            .filter((p) => !isNpc(p))
            .map((p) => (
              <UserCard player={p} />
            ))}
        </div>
      );
    };
  },
});
