<script lang="ts" setup>
import { useTooltip } from "@longhorn/components/Charts/composable.ts"; // Adjust path if needed

const { tooltipState } = useTooltip();
</script>

<template>
  <div
    v-if="tooltipState.visible"
    class="app-tooltip"
    :style="{
      transform: `translate(${tooltipState.x}px, ${tooltipState.y}px)`,
    }"
    v-html="tooltipState.content"
  ></div>
</template>

<style lang="scss" scoped>
.app-tooltip {
  position: fixed; /* Use fixed to float over everything */
  top: 0;
  left: 0;
  background: var(--tooltip-bg);
  color: var(--tooltip-text);
  padding: 4px 8px;
  border-radius: var(--border-radius);
  pointer-events: none; /* Tooltip should not be interactive */
  transition: opacity 0.1s ease;
  white-space: nowrap;
  z-index: 1000; /* Ensure it's on top of other elements */
}
</style>
