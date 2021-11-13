import { defineComponent } from "@vue/runtime-core";
import { usePlayers } from "../../core/Player";
import { createPlayerAlert } from "../UserList";

export default defineComponent(() => {
  const { addPlayer } = usePlayers();

  const clickAddPlayer = async () => {
    const player = await createPlayerAlert();
    addPlayer(player);
  };

  return () => {
    return (
      <div class="fixed bottom-20 right-5">
        <div class="artboard artboard-demo bg-base-200">
          <ul class="menu w-16 py-3 shadow-lg bg-base-100 rounded-box">
            <li>
              <a>
                <i class="gg-arrow-up"></i>
              </a>
            </li>
            <li>
              <a onClick={clickAddPlayer}>
                <i class="gg-user-add"></i>
              </a>
            </li>
            <li>
              <a>
                <i class="gg-games"></i>
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  };
});
