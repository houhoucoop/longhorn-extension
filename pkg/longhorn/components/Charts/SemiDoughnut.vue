<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  ChartOptions,
  Plugin,
} from "chart.js";
import { useStore } from "vuex";
import { useI18n } from "@shell/composables/useI18n";
import {
  useTooltip,
  formatTooltipContent,
} from "@longhorn/components/Charts/composable";

Chart.register(DoughnutController, ArcElement, Tooltip);

type DoughnutChart = Chart<"doughnut", number[], string>;
type OriginalIndex = number;
type FilteredIndex = number;

const props = withDefaults(
  defineProps<{
    labels?: string[];
    datasets?: { data: (number | string)[]; backgroundColor: string[] }[];
    suffix?: string;
    resourceNameKey?: string;
    activeIndex?: OriginalIndex | null;
  }>(),
  { suffix: "" }
);

const emit = defineEmits<{
  (e: "update:activeIndex", value: OriginalIndex | null): void;
}>();

const store = useStore();
const { t } = useI18n(store);
const { showTooltip, hideTooltip } = useTooltip();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: DoughnutChart | null = null;
const isMouseOutside = ref(true);
const borderColor = ref("");
const hoverBorderColor = ref("");

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function updateColorsFromTheme() {
  if (typeof window !== "undefined") {
    const bodyStyles = getComputedStyle(document.body);
    const bg = bodyStyles.getPropertyValue("--body-bg").trim();
    const border = bodyStyles.getPropertyValue("--box-bg").trim();

    borderColor.value = bg || "#FFFFFF";
    hoverBorderColor.value = border || "#F0F0FB";
  }
}

const stableChartState = computed(() => {
  const labels: string[] = [];
  const data: number[] = [];
  const backgroundColor: string[] = [];
  const indexMap: OriginalIndex[] = [];

  const sourceLabels = props.labels || [];
  const sourceDataset = props.datasets?.[0];

  if (sourceDataset) {
    sourceDataset.data.forEach((value, originalIndex) => {
      const numeric = typeof value === "string" ? parseFloat(value) : value;
      if (!isNaN(numeric) && numeric > 0) {
        labels.push(sourceLabels[originalIndex]);
        data.push(numeric);
        backgroundColor.push(sourceDataset.backgroundColor[originalIndex]);
        indexMap.push(originalIndex);
      }
    });
  }

  return {
    chartData: {
      labels,
      datasets: [{ data, backgroundColor }],
    },
    indexMap,
    total: data.reduce((a, b) => a + b, 0),
  };
});

const activeFilteredIndex = computed<FilteredIndex | null>(() => {
  if (props.activeIndex == null) return null;
  const idx = stableChartState.value.indexMap.indexOf(props.activeIndex);
  return idx === -1 ? null : idx;
});

const activeSlice = computed(() => {
  const idx = activeFilteredIndex.value;
  if (idx == null) return null;
  return {
    label: stableChartState.value.chartData.labels[idx],
    value: stableChartState.value.chartData.datasets[0].data[idx],
  };
});

const displayNumber = computed(() => {
  const value = activeSlice.value?.value ?? stableChartState.value.total ?? 0;
  return `${round(value)} ${props.suffix || ""}`;
});
const displayLabel = computed(() => activeSlice.value?.label ?? "In Total");

function handleMouseEnter() {
  isMouseOutside.value = false;
}
function handleMouseLeave() {
  isMouseOutside.value = true;
  if (props.activeIndex != null) emit("update:activeIndex", null);
  hideTooltip();
}

const fixCenterPlugin: Plugin<"doughnut"> = {
  id: "fixCenter",
  beforeDraw(chart) {
    const meta = chart.getDatasetMeta(0);
    if (!meta?.data?.length) return;
    const { width, height } = chart;
    const outerRadius = Math.min(width, height) / 2;
    const cutoutRatio = parseFloat(chart.options.cutout as string) / 100 || 0.8;
    const innerRadius = outerRadius * cutoutRatio;
    const cx = width / 2;
    const cy = height / 2;

    meta.data.forEach((seg) => {
      const arc = seg as ArcElement;
      seg.x = cx;
      seg.y = cy;
      arc.outerRadius = outerRadius - 2;
      arc.innerRadius = innerRadius - 2;
    });
  },
};

const chartOptions: ChartOptions<"doughnut"> = {
  rotation: -120,
  circumference: 240,
  cutout: "80%",
  responsive: true,
  maintainAspectRatio: true,
  elements: {
    arc: {
      borderRadius: 3,
      hoverOffset: 2,
      borderWidth: 2,
      borderColor: (context) => {
        return context.active ? hoverBorderColor.value : borderColor.value;
      },
    },
  },
  onHover: (event, elements) => {
    if (isMouseOutside.value) return;

    const mouseEvent = event.native;
    if (!mouseEvent) {
      hideTooltip();
      return;
    }

    const filteredIdx = elements.length ? elements[0].index : null;
    const originalIdx =
      filteredIdx != null ? stableChartState.value.indexMap[filteredIdx] : null;

    if (props.activeIndex !== originalIdx) {
      emit("update:activeIndex", originalIdx);
    }

    if (filteredIdx !== null && originalIdx !== null) {
      const content = formatTooltipContent({
        label: props.labels?.[originalIdx] ?? "",
        value: stableChartState.value.chartData.datasets[0].data[filteredIdx],
        total: stableChartState.value.total,
        suffix: props.suffix,
        resourceNameKey: props.resourceNameKey,
        t,
      });
      showTooltip(content, mouseEvent as MouseEvent);
    } else {
      hideTooltip();
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: false,
    },
  },
  interaction: { mode: "nearest", intersect: false },
};

function attachListeners(canvas: HTMLCanvasElement) {
  canvas.addEventListener("mouseenter", handleMouseEnter);
  canvas.addEventListener("mouseleave", handleMouseLeave);
}
function detachListeners(canvas: HTMLCanvasElement) {
  canvas.removeEventListener("mouseenter", handleMouseEnter);
  canvas.removeEventListener("mouseleave", handleMouseLeave);
}

function cleanup() {
  if (chartInstance?.canvas) {
    detachListeners(chartInstance.canvas);
  }
  chartInstance?.destroy();
}

function renderChart() {
  if (!canvasRef.value) return;

  cleanup();

  chartInstance = new Chart(canvasRef.value, {
    type: "doughnut",
    data: stableChartState.value.chartData,
    options: chartOptions,
    plugins: [fixCenterPlugin],
  });

  attachListeners(chartInstance.canvas);
}

onMounted(() => {
  updateColorsFromTheme();
  renderChart();
});

onBeforeUnmount(cleanup);

watch(
  () => store.getters["prefs/theme"],
  () => {
    updateColorsFromTheme();
    chartInstance?.update();
  }
);

watch(
  () => stableChartState.value.chartData,
  () => {
    renderChart();
  },
  { deep: true }
);

watch(
  activeFilteredIndex,
  (filteredIdx) => {
    if (!chartInstance) return;
    chartInstance.setActiveElements(
      filteredIdx == null ? [] : [{ datasetIndex: 0, index: filteredIdx }]
    );
    chartInstance.update();
  },
  { flush: "post" }
);
</script>

<template>
  <div class="chart-container">
    <canvas ref="canvasRef" />
    <div class="center-text">
      <div class="number">{{ displayNumber }}</div>
      <div class="label">{{ displayLabel }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chart-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-width: 0;
}
.chart-container canvas {
  width: 100% !important;
  height: 100% !important;
}
.center-text {
  position: absolute;
  inset: 0;
  pointer-events: none;
  text-align: center;
}
.center-text .number {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: 600;
  font-size: 18px;
  white-space: nowrap;
}
.center-text .label {
  position: absolute;
  bottom: 0%;
  left: 50%;
  transform: translate(-50%, -75%);
  font-weight: 400;
  font-size: 14px;
  white-space: nowrap;
}
</style>
