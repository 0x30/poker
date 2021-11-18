import { computed, defineComponent, PropType } from "@vue/runtime-core";
import { ref } from "vue";
import { playerName, playerNameCode, usePlayers } from "../../core/Player";
import { Game, Player } from "../../core/model";
import { splitCards } from "../../core/Card";
import { useMountComponentAndAnimed } from "../../core/useMountComponentAndAnimed";
import { getPermutations } from "../../core/util";

const SelectPlayerItem = defineComponent({
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
    selectd: Boolean,
    onClick: Function as PropType<(player: Player) => void>,
  },
  setup: (props) => {
    return () => {
      return (
        <div
          class={`card shadow-lg compact cursor-pointer side ${
            props.selectd ? "bg-primary" : "bg-base-100"
          }`}
          onClick={() => props.onClick?.(props.player)}
        >
          <div class="flex-row items-center space-x-4 card-body">
            <div>
              <div class="avatar placeholder">
                <div class="bg-neutral-focus text-neutral-contentx rounded-full w-14 h-14">
                  <span>{playerNameCode(props.player)}</span>
                </div>
              </div>
            </div>
            <div>
              <h2 class={`card-title ${props.selectd ? "text-white" : null}`}>
                {playerName(props.player)}
              </h2>
              <p
                class={`${
                  props.selectd ? "text-white" : "text-base-content"
                } text-opacity-40`}
              >
                {props.player?.host}
              </p>
            </div>
          </div>
        </div>
      );
    };
  },
});

const SelectPlayer = defineComponent({
  props: {
    onSubmit: Function as PropType<(games: Game[]) => void>,
    onDismiss: Function as PropType<() => void>,
  },
  setup: (props) => {
    const { players } = usePlayers();

    /// 重复对战次数
    const repeatCountRef = ref<string>();
    const repeatCountValue = computed(() => {
      const result = Number.parseInt(repeatCountRef.value ?? "1");
      const count = Number.isNaN(result) ? 1 : result;
      return Math.max(1, count);
    });

    const autoStartRef = ref(false);

    const selectPlayers = ref<Player[]>([]);
    const isSelected = (player: Player) => {
      return selectPlayers.value.find((p) => p.id === player.id) !== undefined;
    };
    const selectPlayer = (player: Player) => {
      if (isSelected(player)) {
        selectPlayers.value = selectPlayers.value.filter(
          (p) => p.id !== player.id
        );
      } else {
        selectPlayers.value.push(player);
      }
    };

    const isCanSubmit = computed(() => selectPlayers.value.length >= 3);

    const click = () => {
      // 每一组三个人，按照选中的个数划分组
      const permutationPlayers = getPermutations(selectPlayers.value, 3);
      // 按照组 每一组重复对战次数
      const result = permutationPlayers.flatMap((players) => {
        const res = new Array(repeatCountValue.value).fill("").map(() => {
          return splitCards(players);
        });
        return res;
      });
      props.onSubmit?.(result.map((r) => new Game(r, autoStartRef.value)));
    };

    return () => {
      return (
        <div class="modal visible opacity-100 pointer-events-auto">
          <div class="modal-box ">
            <div class="grid grid-cols-2 gap-3">
              {players.value.map((p) => (
                <SelectPlayerItem
                  key={p.id}
                  player={p}
                  selectd={isSelected(p)}
                  onClick={(p) => selectPlayer(p)}
                />
              ))}
            </div>

            <div class="flex items-center space-x-3">
              <div class="form-control mt-3 flex-1">
                <label class="label">
                  <span class="label-text">每组选手的对战次数</span>
                </label>
                <input
                  type="number"
                  v-model={repeatCountRef.value}
                  max={10}
                  placeholder="默认一次，请尽可能的不要超过5次"
                  class="input input-bordered font-mono"
                />
              </div>

              <div class="form-control mt-3 flex flex-col">
                <label class="label">
                  <span class="label-text">是否自动开对战</span>
                </label>
                <input
                  type="checkbox"
                  v-model={autoStartRef.value}
                  class="toggle toggle-lg self-center"
                />
              </div>
            </div>

            <div class="modal-action">
              <button
                class="btn btn-primary px-8"
                disabled={!isCanSubmit.value}
                onClick={click}
              >
                增加
              </button>
              <button class="btn px-8" onClick={props.onDismiss}>
                取消
              </button>
            </div>
          </div>
        </div>
      );
    };
  },
});

export const useGameAlert = () => {
  return new Promise<Game[]>((resolver) => {
    const close = useMountComponentAndAnimed({
      component: (
        <SelectPlayer
          onDismiss={() => close()}
          onSubmit={(games) => {
            close();
            resolver(games);
          }}
        />
      ),
    });
  });
};
