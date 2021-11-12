import {
  Component,
  createApp,
  defineComponent,
  onMounted,
  PropType,
  ref,
  Transition,
} from "vue";

const popupPools: (() => void)[] = [];

/**
 * 装载组件，并且设置动画
 *
 * @param component 组件
 * @param enterAnimed 进入动画
 * @param ignorePopupManager 是否忽略进入公共弹出框管理
 * @param leaveAnimed 退出动画
 */
export const useMountComponentAndAnimed = (params: {
  component: Component;
  ignorePopupManager?: boolean;
  enterAnimed?: (el: Element, done: () => void) => void;
  leaveAnimed?: (el: Element, done: () => void) => void;
}) => {
  const { component, enterAnimed, leaveAnimed } = params;

  /// create document
  const container = document.createElement("div");
  document.body.appendChild(container);

  /// create modal component
  const Modal = defineComponent({
    props: {
      close: Function as PropType<(method: () => void) => void>,
      destory: Function as PropType<() => void>,
    },
    setup: (props) => {
      const isShowRef = ref(false);
      props.close?.(() => (isShowRef.value = false));
      onMounted(() => (isShowRef.value = true));
      return () => (
        <Transition
          onEnter={enterAnimed}
          onLeave={(el, done) => {
            (el as HTMLElement).style.pointerEvents = "none";
            if (leaveAnimed) leaveAnimed(el, done);
            else setTimeout(done, 10);
          }}
          onAfterLeave={props.destory}
        >
          {isShowRef.value ? component : null}
        </Transition>
      );
    },
  });

  /// replace the method later
  let closeMethod = () => {
    //
  };

  const app = createApp(
    <Modal
      style={{ zIndex: 20 }}
      close={(method) => (closeMethod = method)}
      destory={() => {
        app.unmount();
        document.body.removeChild(container);
      }}
    />
  );
  app.mount(container);

  if (params.ignorePopupManager !== true) popupPools.push(closeMethod);
  return () => {
    if (params.ignorePopupManager !== true) popupPools.pop();
    closeMethod();
  };
};

/// return true 说明页面可以反悔
/// return false 说明页面不可返回
export const useCheckBeforeEach = () => {
  if (popupPools.length <= 0) return true;
  const close = popupPools.pop();
  close?.();
  return false;
};
