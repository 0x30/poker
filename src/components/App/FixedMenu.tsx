import { defineComponent } from "@vue/runtime-core";

export default defineComponent(() => {
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
              <a>
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
