import { ref, readonly } from "vue";
import { useI18n } from "@shell/composables/useI18n";
import type { VirtualElement } from "@popperjs/core";

// --- Type Definitions ---

interface TooltipState {
  visible: boolean;
  content: string;
  reference: HTMLElement | VirtualElement | null;
}

export interface TooltipContentOptions {
  label: string;
  value: number;
  total: number;
  suffix?: string;
  resourceNameKey?: string;
  t: ReturnType<typeof useI18n>["t"];
}

// --- Shared State (Singleton) ---

// This singleton state ensures that only one tooltip can be active across the
// entire application at any given time. This simplifies tooltip management
// by preventing multiple tooltips from appearing simultaneously.
const tooltipState = ref<TooltipState>({
  visible: false,
  content: "",
  reference: null,
});

// --- Private Helper Functions ---

/**
 * Creates a Popper-compatible VirtualElement based on a MouseEvent.
 * This allows the tooltip to be positioned relative to the cursor's location.
 */
function _createVirtualElementFromEvent(event: MouseEvent): VirtualElement {
  return {
    getBoundingClientRect: (): DOMRect => ({
      width: 0,
      height: 0,
      top: event.clientY,
      left: event.clientX,
      right: event.clientX,
      bottom: event.clientY,
      x: event.clientX,
      y: event.clientY,
      toJSON: () => JSON.stringify({ top: event.clientY, left: event.clientX }),
    }),
  };
}

// --- Reusable Content Formatter ---

export function formatTooltipContent(options: TooltipContentOptions): string {
  const { label, value, total, suffix = "", resourceNameKey, t } = options;
  const percent = total > 0 ? ((value / total) * 100).toFixed(0) : "0";
  const resourceText = resourceNameKey
    ? t(resourceNameKey, { count: value })
    : "";

  return `${label} ${resourceText}: ${value}${suffix} (${percent}%)`;
}

// --- The Composable Function ---

export function useTooltip() {
  /**
   * Shows the global tooltip.
   * @param content The HTML content to display.
   * @param refOrEvent The reference element or a mouse event for positioning.
   */
  const showTooltip = (
    content: string,
    refOrEvent: HTMLElement | MouseEvent
  ) => {
    let reference: HTMLElement | VirtualElement;

    if (refOrEvent instanceof MouseEvent) {
      reference = _createVirtualElementFromEvent(refOrEvent);
    } else if (refOrEvent instanceof HTMLElement) {
      reference = refOrEvent;
    } else {
      // Enforce type safety at runtime for unexpected inputs.
      throw new TypeError(
        "Failed to show tooltip: reference must be an HTMLElement or MouseEvent."
      );
    }

    tooltipState.value = {
      visible: true,
      content,
      reference,
    };
  };

  /**
   * Hides the global tooltip.
   */
  const hideTooltip = () => {
    // To prevent race conditions, only modify the visibility flag.
    // The rest of the state will be overwritten by the next `showTooltip` call.
    if (tooltipState.value.visible) {
      tooltipState.value.visible = false;
    }
  };

  return {
    tooltipState: readonly(tooltipState),
    showTooltip,
    hideTooltip,
  };
}
