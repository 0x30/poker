import { defineComponent } from "@vue/runtime-core";
import GameList from "../GameList";
import UserList from "../UserList";

export default defineComponent(() => {
  return () => {
    return (
      <div class="flex flex-col flex-1 bg-base-200 mt-16 pt-10 pr-5 pl-5 gap-5">
        <UserList />
        <GameList />
      </div>
    );
  };
});
