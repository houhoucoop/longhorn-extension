import { ref, readonly } from "vue";

const tooltipState = ref({
  visible: false,
  content: "",
  reference: null,
});

function _createVirtualElementFromEvent(event) {
  return {
    getBoundingClientRect: () => ({
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

export function formatTooltipContent(options) {
  const { value, total } = options;
  const percent = total > 0 ? ((value / total) * 100).toFixed(0) : "0";

  return `${percent}%`;
}

export function useTooltip() {
  const showTooltip = (content, refOrEvent) => {
    let reference;
    if (refOrEvent instanceof MouseEvent) {
      reference = _createVirtualElementFromEvent(refOrEvent);
    } else if (refOrEvent instanceof HTMLElement) {
      reference = refOrEvent;
    } else {
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

  const hideTooltip = () => {
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