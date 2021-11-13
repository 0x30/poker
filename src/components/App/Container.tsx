import { defineComponent } from "@vue/runtime-core";
import UserList from "../UserList";

export default defineComponent(() => {
  return () => {
    return (
      <div class="flex flex-col flex-1 bg-base-200 mt-16 pt-10 pr-5 pl-5 gap-5">
        <UserList />
        <div class="flex-1 flex flex-col">
          <div style={{ height: "3000px" }}></div>
        </div>
      </div>
    );
  };
});
