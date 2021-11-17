import { defineComponent, PropType } from "vue";

export const GameMenu = defineComponent({
  props: {
    isAsking: Boolean,
    isPlaying: Boolean,
    isFinish: Boolean,
    onClose: Function as PropType<() => void>,
    onToggle: Function as PropType<() => void>,
    onGoDetail: Function as PropType<() => void>,
    onNext: Function as PropType<() => Promise<void>>,
  },
  setup: (props) => {
    return () => {
      return (
        <div class="btn-group">
          {props.isFinish === false && props.onToggle ? (
            <button
              data-tip={
                props.isPlaying
                  ? "自动模式，点击切换为手动"
                  : "手动模式，点击切换为自动"
              }
              class={`btn tooltip btn-outline btn-sm ${
                props.isPlaying ? "btn-active" : ""
              }`}
              onClick={props.onToggle}
            >
              {props.isPlaying ? (
                <i class="gg-play-pause transform "></i>
              ) : (
                <i class="gg-play-button transform "></i>
              )}
            </button>
          ) : null}

          {props.onGoDetail && (props.isPlaying === false || props.isFinish) ? (
            <button
              data-tip="查看详情"
              class="tooltip btn btn-outline btn-sm"
              onClick={props.onGoDetail}
            >
              <i class="gg-eye transform "></i>
            </button>
          ) : null}
          {props.isFinish ||
          props.isPlaying ||
          props.onNext === undefined ? null : (
            <>
              <button
                data-tip="当前用户执行出牌逻辑"
                class={`btn btn-outline btn-sm tooltip px-5 ${
                  props.isAsking ? "loading" : ""
                }`}
                onClick={props.onNext}
              >
                <i class="gg-play-track-next transform "></i>
              </button>
            </>
          )}

          {props.onClose ? (
            <button class="btn btn-sm btn-outline" onClick={props.onClose}>
              <i class="gg-close"></i>
            </button>
          ) : null}
        </div>
      );
    };
  },
});
