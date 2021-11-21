import { defineComponent, PropType } from "vue";

export const GameMenu = defineComponent({
  props: {
    isAsking: Boolean,
    isPlaying: Boolean,
    isFinish: Boolean,
    isCanCancel: Boolean,
    isTrash: Boolean,
    onDelGame: Function as PropType<() => void>,
    onTrash: Function as PropType<() => void>,
    onCancel: Function as PropType<() => void>,
    onClose: Function as PropType<() => void>,
    onToggle: Function as PropType<() => void>,
    onGoDetail: Function as PropType<() => void>,
    onNext: Function as PropType<() => Promise<void>>,
  },
  setup: (props) => {
    return () => {
      const btns = () => {
        const res = [];

        if (props.isAsking === false && props.onDelGame) {
          res.push(
            <button
              data-tip="删除游戏"
              class="tooltip btn btn-outline btn-sm px-5"
              onClick={props.onDelGame}
            >
              <i class="gg-trash"></i>
            </button>
          );
        }

        if (props.onTrash) {
          res.push(
            <button
              disabled={props.isCanCancel === false}
              data-tip="移除全部操作"
              class="tooltip btn btn-outline btn-sm"
              onClick={props.onTrash}
            >
              <i class="gg-undo"></i>
            </button>
          );
        }

        if (props.onCancel) {
          res.push(
            <button
              disabled={props.isCanCancel === false}
              class="btn btn-outline btn-sm"
              onClick={props.onCancel}
            >
              <i class="gg-mail-reply"></i>
            </button>
          );
        }

        return res;
      };

      return (
        <div class="btn-group">
          {btns()}
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

export const GameMenuStyle2 = defineComponent({
  props: {
    isAsking: Boolean,
    isPlaying: Boolean,
    isFinish: Boolean,
    isCanCancel: Boolean,
    isTrash: Boolean,
    onDelGame: Function as PropType<() => void>,
    onTrash: Function as PropType<() => void>,
    onCancel: Function as PropType<() => void>,
    onClose: Function as PropType<() => void>,
    onToggle: Function as PropType<() => void>,
    onGoDetail: Function as PropType<() => void>,
    onNext: Function as PropType<() => Promise<void>>,
  },
  setup: (props) => {
    return () => {
      const btns = () => {
        const res = [];

        if (props.isAsking === false && props.onDelGame) {
          res.push(
            <button
              class="btn btn-sm btn-square px-5"
              onClick={props.onDelGame}
            >
              <i class="gg-trash"></i>
            </button>
          );
        }

        if (
          props.isFinish === false &&
          props.isPlaying === false &&
          props.isAsking === false
        ) {
          if (props.onTrash) {
            res.push(
              <button
                disabled={props.isCanCancel === false}
                class="btn btn-sm btn-square"
                onClick={props.onTrash}
              >
                <i class="gg-undo"></i>
              </button>
            );
          }

          if (props.onCancel) {
            res.push(
              <button
                disabled={props.isCanCancel === false}
                class="btn btn-sm btn-square"
                onClick={props.onCancel}
              >
                <i class="gg-mail-reply"></i>
              </button>
            );
          }
        }

        return res;
      };

      return (
        <>
          {btns()}
          {props.isFinish === false && props.onToggle ? (
            <button
              class={`btn btn-sm btn-square ${
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
            <button class="btn btn-sm btn-square" onClick={props.onGoDetail}>
              <i class="gg-eye transform "></i>
            </button>
          ) : null}
          {props.isFinish ||
          props.isPlaying ||
          props.onNext === undefined ? null : (
            <>
              <button
                class={`btn btn-sm btn-square px-2 ${
                  props.isAsking ? "loading" : ""
                }`}
                onClick={props.onNext}
              >
                <i class="gg-play-track-next transform "></i>
              </button>
            </>
          )}

          {props.onClose ? (
            <button class="btn btn-sm btn-square" onClick={props.onClose}>
              <i class="gg-close"></i>
            </button>
          ) : null}
        </>
      );
    };
  },
});
