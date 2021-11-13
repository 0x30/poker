import { defineComponent, Prop, PropType, ref } from "vue";
import { Player, usePlayers } from "../core/Player";
import { useMountComponentAndAnimed } from "../core/useMountComponentAndAnimed";
import { generateId } from "../core/util";

const User = defineComponent({
  props: {
    onSubmit: {
      type: Function as PropType<(player: Player) => void>,
      required: true,
    },
    onDismiss: Function as PropType<() => void>,
  },
  setup: (props) => {
    const ipRef = ref<string>("");
    const nikeNameRef = ref<string>();

    const isAddingRef = ref(false);

    const click = () => {
      isAddingRef.value = true;
      props.onSubmit(new Player(ipRef.value, nikeNameRef.value));
    };

    return () => {
      return (
        <div class="modal visible opacity-100 pointer-events-auto">
          <div class="modal-box">
            <div class="form-control">
              <label class="label">
                <span class="label-text">HOST</span>
              </label>
              <input
                type="text"
                v-model={ipRef.value}
                placeholder="输入接口访问地址 例:192.168.0.1"
                class="input input-bordered font-mono"
              />
            </div>
            <div class="form-control">
              <label class="label">
                <span class="label-text">用户昵称</span>
              </label>
              <input
                type="text"
                v-model={nikeNameRef.value}
                placeholder="请输入用户昵称(可选)"
                class="input input-bordered font-mono"
              />
            </div>

            <div class="modal-action">
              <button
                class={`btn btn-primary px-8 ${
                  isAddingRef.value ? "loading" : null
                }`}
                onClick={click}
              >
                增加
              </button>
              <button
                class="btn px-8"
                disabled={isAddingRef.value}
                onClick={props.onDismiss}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      );
    };
  },
});

export const createPlayerAlert = () => {
  return new Promise<Player>((resolver) => {
    const close = useMountComponentAndAnimed({
      component: (
        <User
          onDismiss={() => close()}
          onSubmit={(player) => {
            close();
            resolver(player);
          }}
        />
      ),
    });
  });
};

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
        <div class="grid grid-rows-1 grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-3">
          <button onClick={add}>增加</button>
          {players.value.map((p) => (
            <UserCard player={p} />
          ))}
        </div>
      );
    };
  },
});

export default UserList;
