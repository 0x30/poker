import { defineComponent } from "@vue/runtime-core";

export default defineComponent(() => {
  return () => {
    return (
      <div class="navbar fixed top-0 right-0 left-0 lg:top-5 lg:right-5 lg:left-5 bg-neutral text-neutral-content lg:rounded-box z-50">
        <div class="flex-1 px-2 mx-2">
          <span class="text-lg font-bold">跑得快</span>
        </div>
        <div class="flex-none">
          <div class="form-control">
            <input type="text" placeholder="请输入要搜索的东西" class="input input-ghost" />
          </div>
        </div>
        <div class="flex-none">
          <button class="btn btn-square btn-ghost">
          <i class="gg-user-add"></i>
          </button>
        </div>
        <div class="flex-none">
          <button class="btn btn-square btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="inline-block w-6 h-6 stroke-current"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    );
  };
});
