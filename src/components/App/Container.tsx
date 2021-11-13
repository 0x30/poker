import { computed, defineComponent, PropType } from "@vue/runtime-core";
import { ref } from "vue";
import { useGames } from "../../core/Game";
import {
  Player,
  playerName,
  playerNameCode,
  usePlayers,
} from "../../core/Player";
import UserList from "../UserList";

export default defineComponent(() => {
  const { players } = usePlayers();

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
    // props.onSubmit(new Player(ipRef.value, nikeNameRef.value));
  };

  const { games } = useGames();

  return () => {
    return (
      <div class="flex flex-col flex-1 bg-base-200 mt-16 pt-10 pr-5 pl-5 gap-5">
        <UserList />
        <div class="flex-1 flex flex-col">
          {games.value.map((g) => (
            <div>
              {g.id}
              {g.players.map((p) => p.nikeName).join(",")}
            </div>
          ))}
        </div>
      </div>
    );
  };
});
