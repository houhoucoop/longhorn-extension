<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { useI18n } from "@shell/composables/useI18n";
import SemiDoughnut from "@longhorn/components/Charts/SemiDoughnut";
import {
  useTooltip,
  formatTooltipContent,
} from "@longhorn/components/Charts/composable";
import Link from '@shell/components/formatter/Link';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  chartData: {
    type: Object,
    required: true,
  },
  horizontal: {
    type: Boolean,
    default: false,
  },
});

const { t } = useI18n(useStore());

const { showTooltip, hideTooltip } = useTooltip();

const activeIndex = ref(null);

const dataset = computed(() => props.chartData.datasets[0]);

const total = computed(() => {
  if (!dataset.value) {
    return 0;
  }
  const sum = dataset.value.data.reduce((a, b) => a + b, 0);
  return Math.round(sum * 100) / 100;
});

const formattedValues = computed(() =>
  dataset.value.data.map((val) => {
    if (val === 0) {
      return "-";
    }
    return props.chartData.suffix
      ? `${val} ${props.chartData.suffix}`
      : `${val}`;
  })
);

const isLinkableResource = computed(() => {
  return (
    props.chartData.resourceNameKey === 'longhorn.dashboard.node.title' ||
    props.chartData.resourceNameKey === 'longhorn.dashboard.volume.title'
  );
});

function handleRowEnter(index, event) {
  if (dataset.value.data[index] === 0) {
    return;
  }

  activeIndex.value = index;

  const content = formatTooltipContent({
    label: props.chartData.labels[index],
    value: dataset.value.data[index],
    total: total.value,
    suffix: props.chartData.suffix,
    resourceNameKey: props.chartData.resourceNameKey,
    t,
  });
  showTooltip(content, event.currentTarget);
}

function handleRowLeave() {
  activeIndex.value = null;
  hideTooltip();
}
</script>

<template>
  <div
    class="box"
    :class="{ horizontal: props.horizontal }"
  >
    <h3 class="chart-title">{{ props.title }}</h3>
    <div class="split-container" :class="{ horizontal: props.horizontal }">
      <div class="chart-panel">
        <SemiDoughnut
          :labels="props.chartData.labels"
          :datasets="props.chartData.datasets"
          :suffix="props.chartData.suffix"
          :resourceNameKey="props.chartData.resourceNameKey"
          v-model:activeIndex="activeIndex"
        />
      </div>

      <div class="metrics-panel">
        <div
          v-for="(label, i) in props.chartData.labels"
          :key="label"
          class="metrics-row"
          :class="{ 'active-row': activeIndex === i }"
          @mouseenter="handleRowEnter(i, $event)"
          @mouseleave="handleRowLeave"
        >
          <div
            class="metrics-status"
            :style="{ backgroundColor: dataset.backgroundColor[i] }"
          />
          <component
            :is="isLinkableResource && dataset.data[i] > 0 ? Link : 'span'"
            class="metrics-label"
            :class="{
              'secondary-text-link': isLinkableResource && dataset.data[i] > 0,
              'text-secondary': dataset.data[i] === 0 && !isLinkableResource
            }"
            v-bind="isLinkableResource && dataset.data[i] > 0 ? { value: label, options: { internal: true } } : {}"
          >
            <template v-if="!(isLinkableResource && dataset.data[i] > 0)">
              {{ label }}
            </template>
          </component>
          <div class="metrics-value">
            {{ formattedValues[i] }}
          </div>
        </div>

        <div class="metrics-row total-row">
          <div class="metrics-status"></div>
          <div class="metrics-label">Total</div>
          <div class="metrics-value">
            {{ total }}
            {{ props.chartData.suffix }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.box {
  background: var(--simple-box-bg);
  box-shadow: 0 0 10px var(--simple-box-shadow);
  border: 1px solid var(--simple-box-border);
  padding: 16px;
  border-radius: 6px;
  min-width: 380px;
}

.chart-title {
  padding: 0 12px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.split-container {
  display: flex;
  gap: 16px;
  flex-direction: row;
  align-items: center;
}

.chart-panel {
  flex: 0 0 130px;
  width: 130px;
  margin: 8px 12px;
}

.metrics-panel {
  flex: 1;
  width: 100%;
  cursor: default;
}

.metrics-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-radius: 4px;

  &.active-row {
    background-color: var(--box-bg);
  }
}

.metrics-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
}

.metrics-label {
  flex: 1;
  line-height: 1.5;
  padding-right: 16px;
  color: var(--body-text);
}

.metrics-value {
  text-align: right;
}

.total-row {
  font-weight: 600;
  margin-bottom: 0;

  .metrics-status {
    border: 1px solid #dcdee4;
    background-color: transparent;
  }
}

.text-secondary {
  color: var(--link-text-secondary);
}

@media (min-width: map-get($breakpoints, "--viewport-9")) {
  .split-container.horizontal {
    flex-direction: column;
    align-items: center;
  }
}

@media (min-width: map-get($breakpoints, "--viewport-12")) {
  .split-container {
    flex-direction: column;

    &.horizontal {
      flex-direction: row;
      align-items: flex-start;
    }
  }
}
</style>
