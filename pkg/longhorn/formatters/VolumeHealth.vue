<script setup>
import { computed } from 'vue';

const props = defineProps({
  value: {
    type: Object,
    default: () => ({}),
  },
  row: {
    type: Object,
    default: () => ({}),
  },
});

const volumeStatus = computed(() => props.row.volumeStatus || props.value);
const status = computed(() => props.row.status || {});
const state = computed(() => props.row.state);
const replicas = computed(() => status.value.replicas || props.row.replicas || []);

const stateDisplay = computed(() => volumeStatus.value?.stateDisplay || '');
const stateBackground = computed(() => volumeStatus.value?.stateBackground || 'badge-disabled');

// Check if engine is upgrading
const isEngineUpgrading = computed(() => {
  const desiredImage = props.row.spec?.image || '';
  const currentImage = props.row.status?.currentImage || '';

  return desiredImage && currentImage && desiredImage !== currentImage;
});

// Reference: longhorn-ui/src/routes/volume/helper/index.js needToWaitDone
const showLoading = computed(() => {
  return (
    state.value === '' ||
    String(state.value || '').endsWith('ing') ||
    replicas.value.some((replica) => replica.mode?.toLowerCase() === 'wo') ||
    isEngineUpgrading.value
  );
});

// Spinner tooltip
const spinnerTooltip = computed(() => {
  if (isEngineUpgrading.value) {
    return 'longhorn.volume.engineUpgrading';
  }

  return '';
});

// Progress Logic
const getProgress = (type) => {
  const list = status.value[`${type}Status`] || [];
  const key = `is${type.charAt(0).toUpperCase() + type.slice(1)}ing`;
  const count = list.filter((item) => item[key]).length;

  return count > 0 ? { label: type, percent: Math.floor((count / list.length) * 100) } : null;
};

const progressBars = computed(() => [getProgress('restore'), getProgress('rebuild')].filter(Boolean));
</script>

<template>
  <div class="volume-state">
    <div v-if="progressBars.length" class="progress-section">
      <div v-for="prog in progressBars" :key="prog.label" class="mini-progress">
        <div class="progress-track">
          <div class="progress-fill" :class="prog.label" :style="{ width: `${prog.percent}%` }" />
        </div>
        <span class="progress-text">{{ prog.label }} {{ prog.percent }}%</span>
      </div>
    </div>

    <div class="state-content">
      <span :class="['badge-state', stateBackground]">
        <i
          v-if="showLoading"
          v-tooltip="spinnerTooltip ? t(spinnerTooltip) : ''"
          class="icon icon-spinner icon-spin mr-5"
        />
        <span class="msg">{{ stateDisplay }}</span>
      </span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.volume-state {
  display: flex;
  flex-direction: column;

  .progress-section {
    margin-bottom: 4px;
    .mini-progress {
      display: flex;
      align-items: center;
      gap: 6px;
      .progress-track {
        flex: 1;
        height: 3px;
        background: var(--border);
        border-radius: 2px;
        overflow: hidden;
        .progress-fill {
          height: 100%;
          transition: width 0.4s ease;
          &.restore {
            background: var(--info);
          }
          &.rebuild {
            background: var(--warning);
          }
        }
      }
      .progress-text {
        font-size: 10px;
        color: var(--muted);
        text-transform: capitalize;
      }
    }
  }

  .state-content {
    display: flex;
    align-items: center;
    gap: 3px;

    .badge-state {
      align-items: center;
      display: inline-flex;
      padding: 2px 10px;
      border: 1px solid transparent;
      border-radius: 20px;
      max-width: 110px;
      font-size: 0.85em;

      &.bg-info {
        color: var(--on-info-banner);
        background: var(--info-badge, var(--info-banner));
      }

      &.bg-error {
        color: var(--on-error-banner);
        background: var(--error-badge, var(--error-banner));
      }

      &.bg-warning {
        color: var(--on-warning-banner);
        background: var(--warning-badge, var(--warning-banner));
      }

      &.bg-success {
        color: var(--on-success-banner, var(--success-text));
        background: var(--success-badge, var(--success));
      }

      &.badge-disabled {
        color: var(--badge-state-disabled-text);
        background-color: var(--badge-state-disabled-bg);
        border: 1px solid var(--badge-state-disabled-border);
      }

      .msg {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>
