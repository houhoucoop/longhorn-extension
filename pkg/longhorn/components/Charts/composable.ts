// useTooltip.ts
import { ref, readonly } from "vue";
import { useI18n } from "@shell/composables/useI18n";
import { useStore } from "vuex";

// 1. Create a shared, module-scoped state for the tooltip.
const tooltipState = ref({
  visible: false,
  content: "",
  x: 0,
  y: 0,
});

// 2. Export a reusable content formatting function.
// This ensures the content is identical whether called from the chart or a metric row.
interface TooltipContentOptions {
  label: string;
  value: number;
  total: number;
  suffix?: string;
  resourceNameKey?: string;
  t: ReturnType<typeof useI18n>["t"]; // Pass the translation function
}

export function formatTooltipContent(options: TooltipContentOptions): string {
  const { label, value, total, suffix = "", resourceNameKey, t } = options;
  const percent = total > 0 ? ((value / total) * 100).toFixed(0) : "0";
  const resourceText = resourceNameKey
    ? t(resourceNameKey, { count: value })
    : "";

  return `${label} ${resourceText}: ${value}${suffix} (${percent}%)`;
}

// 3. Export the main composable function.
export function useTooltip() {
  const showTooltip = (content: string, event: MouseEvent) => {
    tooltipState.value = {
      visible: true,
      content,
      x: event.clientX + 10, // Position slightly offset from the cursor
      y: event.clientY + 10,
    };
  };

  const hideTooltip = () => {
    tooltipState.value.visible = false;
  };

  return {
    tooltipState: readonly(tooltipState),
    showTooltip,
    hideTooltip,
  };
}
