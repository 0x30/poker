import { defineComponent, Prop, PropType, ref } from "vue";
import { Player } from "../core/Player";
import { useMountComponentAndAnimed } from "../core/useMountComponentAndAnimed";
import { generateId } from "../core/util";

const User = defineComponent({
  props: {
    onSubmit: {
      type: Function as PropType<(player: Player) => void>,
      required: true,
    },
  },
  setup: (props) => {
    const nameRef = ref("");
    const hostRef = ref("");

    const submit = () => {
      console.log("???提交铜壶信息");

      props.onSubmit({
        id: generateId(),
        nikeName: nameRef.value,
        host: hostRef.value,
      });
    };

    return () => {
      return (
        <div>
          <input v-model={nameRef.value} type="text" placeholder="输入成熟" />
          <input v-model={hostRef.value} type="text" placeholder="输入地址" />
          <button onClick={submit}>提交</button>
        </div>
      );
    };
  },
});

const showAddUser = () => {
  const close = useMountComponentAndAnimed({
    component: (
      <User
        onSubmit={(player) => {
          console.log("????", player);
          close();
        }}
      />
    ),
  });
};

const UserList = defineComponent({
  props: {
    modelValue: {
      type: Array as PropType<Player[]>,
      default: [],
    },
  },
  emits: ["update:modelValue"],
  setup: (props) => {
    return () => {
      return (
        <div>
          <button
            onClick={() => {
              showAddUser();
            }}
          >
            新增
          </button>
        </div>
      );
    };
  },
});

export default UserList;
