import { defineComponent } from "@vue/runtime-core";

export default defineComponent(() => {
  return () => {
    return (
      <div class="flex rounded-box flex-col bg-base-200 mt-16 pt-10 pr-5 pl-5 gap-5">
        <div class="grid grid-rows-1 grid-cols-1 lg:grid-cols-2 xl:grid-cols-4">
          <div class="card shadow-lg compact side bg-base-100">
            <div class="flex-row items-center space-x-4 card-body">
              <div class="flex-1">
                <h2 class="flex card-title">
                  <button class="btn btn-ghost btn-sm btn-circle loading"></button>
                  Downloading...
                </h2>{" "}
                <progress
                  value="70"
                  max="100"
                  class="progress progress-primary"
                ></progress>
              </div>{" "}
              <div class="flex-0">
                <button class="btn btn-circle btn-sm">
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
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="divider">OR</div>
      </div>
    );
  };
});
