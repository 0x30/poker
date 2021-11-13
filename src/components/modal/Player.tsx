import { defineComponent, PropType, ref } from "vue";
import { Player } from "../../core/Player";
import { useMountComponentAndAnimed } from "../../core/useMountComponentAndAnimed";

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

export const usePlayerAlert = () => {
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
