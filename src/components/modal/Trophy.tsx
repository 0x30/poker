import { computed, defineComponent, PropType } from "@vue/runtime-core";
import { ref } from "vue";
import { usePlayers } from "../../core/Player";
import { Game, isNpc, Player, WoodmanPlayer } from "../../core/model";
import { newVersionsplitCards } from "../../core/Card";
import { useMountComponentAndAnimed } from "../../core/useMountComponentAndAnimed";
import { getPermutations } from "../../core/util";
import { SelectPlayerItem } from "./Game";

const SelectPlayer = defineComponent({
  props: {
    onSubmit: Function as PropType<(games: Game[]) => void>,
    onDismiss: Function as PropType<() => void>,
  },
  setup: (props) => {
    const { players: ps } = usePlayers();
    const players = computed(() => ps.value.filter((p) => !isNpc(p)));

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

    const isCanSubmit = computed(() => selectPlayers.value.length >= 2);

    const click = () => {
      // 每组两个人
      const permutationPlayers = getPermutations(selectPlayers.value, 2).map(
        (us) => [...us, ...[WoodmanPlayer]]
      );
      // 按照组 每一组重复对战次数
      const result = permutationPlayers.flatMap((players) => {
        const res = new Array(1).fill("").flatMap(() => {
          return newVersionsplitCards(players);
        });
        return res;
      });
      props.onSubmit?.(
        result.map((r) => {
          const game = new Game(r, true);
          game.__isOnline = true;
          return game;
        })
      );
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

            <div class="modal-action">
              <button
                class="btn btn-primary px-8"
                disabled={!isCanSubmit.value}
                onClick={click}
              >
                开赛
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

export const useTrophyAlert = () => {
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
