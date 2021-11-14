import { defineComponent, PropType } from "vue";
import { usePlayers } from "../core/Player";
import { Player } from "../core/model";

const UserCard = defineComponent({
  props: {
    player: {
      required: true,
      type: Object as PropType<Player>,
    },
  },
  setup: (props) => {
    return () => {
      return (
        <div class="card shadow-lg compact side bg-base-100 px-4 py-3">
          <div class="flex flex-col">
            <div class="flex mb-3 content-between justify-between">
              <div class="flex flex-col items-center">
                <span class="text-xs text-gray-500">参与对战</span>
                <span class="text-sm font-mono font-black">
                  {props.player.joinCount}
                </span>
              </div>
              <div class="avatar placeholder">
                <div class="bg-neutral-focus text-neutral-content rounded-full w-10 h-10">
                  <span>{props.player.nikeName?.slice(0, 1)}</span>
                </div>
              </div>
              <div class="flex flex-col items-center">
                <span class="text-xs text-gray-500">获得胜利</span>
                <span class="text-sm font-mono font-black">
                  {props.player.victoryCount}
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

const UserList = defineComponent({
  props: {
    modelValue: {
      type: Array as PropType<Player[]>,
      default: [],
    },
  },
  emits: ["update:modelValue"],
  setup: (props) => {
    const { players, addPlayer, addJoinCount, addVictoryCount } = usePlayers();

    const add = () => {
      addPlayer(new Player("187878"));
    };

    return () => {
      return (
        <div class="grid grid-rows-1 grid-cols-1 lg:grid-cols-2 xl:grid-cols-6 gap-3">
          {players.value.map((p) => (
            <UserCard player={p} />
          ))}
        </div>
      );
    };
  },
});

export default UserList;
