import { defineComponent, PropType, ref } from "vue";

export const GameMenu = defineComponent({
  props: {
    isAsking: Boolean,
    isPlaying: Boolean,
    isFinish: Boolean,
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
              class={`btn btn-outline btn-sm ${
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
            <button class="btn btn-outline btn-sm" onClick={props.onGoDetail}>
              <i class="gg-eye transform "></i>
            </button>
          ) : null}
          {props.isFinish ||
          props.isPlaying ||
          props.onNext === undefined ? null : (
            <>
              <button
                class={`btn btn-outline btn-sm px-5 ${
                  props.isAsking ? "loading" : ""
                }`}
                onClick={props.onNext}
              >
                <i class="gg-play-track-next transform "></i>
              </button>
            </>
          )}
        </div>
      );
    };
  },
});
