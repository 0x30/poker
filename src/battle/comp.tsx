import { defineComponent, onMounted, PropType, ref, watchEffect } from "vue";
import { Chart, registerables } from "chart.js";

export enum ProgressMode {
  primary = "progress-primary",
  secondary = "progress-secondary",
  accent = "progress-accent",
}

export const ProgressChart = defineComponent({
  props: {
    title: String,
    progress: Number,
    color: String as PropType<ProgressMode>,
  },
  setup: (props) => {
    return () => {
      return (
        <div class="card shadow-lg compact side bg-base-100">
          <div class="flex-row items-center space-x-4 card-body">
            <div class="flex-1">
              <h2 class="flex card-title">
                <button class="btn btn-ghost btn-sm btn-circle loading"></button>
                {props.title}
              </h2>
              <progress
                value={props.progress}
                max="100"
                class={`progress ${props.color}`}
              />
            </div>
          </div>
        </div>
      );
    };
  },
});

export const Table = defineComponent({
  props: {
    datas: {
      type: Array as PropType<Array<any>>,
      required: true,
    },
    ktMap: Object as PropType<{ [key: string]: string }>,
  },
  setup: (props) => {
    const keys = Object.keys(props.datas[0]);

    return () => {
      return (
        <table class="table w-full table-zebra">
          <thead>
            <tr>
              {keys.map((k) => (
                <td>{props.ktMap?.[k]}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.datas.map((data) => (
              <tr>
                {keys.map((k) => (
                  <td>{data[k]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    };
  },
});

export const ChartCompent = defineComponent({
  props: {
    data: {
      type: Object as PropType<{ [key: string]: number }>,
      required: true,
    },
  },
  setup: (props) => {
    Chart.register(...registerables);

    let chart: Chart;
    const backgroundColor = ["#2094f3", "#009485", "#ff9900", "#ff5724"];

    const genData = (propsData: { [key: string]: number }) => {
      const labels = Object.keys(propsData);
      const data = Object.values(propsData);
      return { labels, datasets: [{ data, backgroundColor, hoverOffset: 4 }] };
    };

    watchEffect(() => {
      props.data;
      if (chart === undefined) return;
      chart.data = genData(props.data);
      chart.update();
    });

    const chartRef = ref<HTMLCanvasElement>();

    onMounted(() => {
      if (chartRef.value === undefined) return;
      chart = new Chart(chartRef.value, {
        type: "pie",
        data: genData(props.data),
        options: { animation: false },
      });
    });

    return () => {
      return <canvas ref={chartRef} />;
    };
  },
});
