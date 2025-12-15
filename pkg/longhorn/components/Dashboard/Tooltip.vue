<script lang="ts" setup>
import { ref, watch, onBeforeUnmount, nextTick } from "vue";
import { useTooltip } from "@longhorn/components/Charts/composable";
import {
  createPopper,
  Instance as PopperInstance,
  VirtualElement,
} from "@popperjs/core";

const { tooltipState } = useTooltip();

const tooltipEl = ref<HTMLDivElement | null>(null);
const arrowEl = ref<HTMLDivElement | null>(null);
let popperInstance: PopperInstance | null = null;
let mouseMoveHandler: ((event: MouseEvent) => void) | null = null;

watch(
  () => tooltipState.value.visible,
  async (isVisible) => {
    await nextTick();

    const popperElement = tooltipEl.value;
    const referenceElement = tooltipState.value.reference;

    if (popperInstance) {
      popperInstance.destroy();
      popperInstance = null;
    }
    if (mouseMoveHandler) {
      window.removeEventListener("mousemove", mouseMoveHandler);
      mouseMoveHandler = null;
    }

    if (isVisible && popperElement && referenceElement) {
      let popperReference: HTMLElement | VirtualElement = referenceElement;

      if (!("nodeType" in referenceElement)) {
        const initialRect = referenceElement.getBoundingClientRect();
        let latestCoords = { x: initialRect.left, y: initialRect.top };

        mouseMoveHandler = (event: MouseEvent) => {
          latestCoords = { x: event.clientX, y: event.clientY };
          popperInstance?.update();
        };

        const dynamicVirtualElement: VirtualElement = {
          getBoundingClientRect: (): DOMRect => ({
            width: 0,
            height: 0,
            top: latestCoords.y,
            left: latestCoords.x,
            right: latestCoords.x,
            bottom: latestCoords.y,
            x: latestCoords.x,
            y: latestCoords.y,
            toJSON: () => JSON.stringify(latestCoords),
          }),
        };

        popperReference = dynamicVirtualElement;
        window.addEventListener("mousemove", mouseMoveHandler);
      }

      popperInstance = createPopper(popperReference, popperElement, {
        placement: "top",
        modifiers: [
          { name: "arrow", options: { element: arrowEl.value, padding: 5 } },
          { name: "offset", options: { offset: [0, 12] } },
          { name: "flip", options: { fallbackPlacements: ["bottom"] } },
          { name: "preventOverflow", options: { padding: 10 } },
        ],
      });
    }
  },
  { flush: "post" }
);

onBeforeUnmount(() => {
  if (mouseMoveHandler) {
    window.removeEventListener("mousemove", mouseMoveHandler);
  }
  popperInstance?.destroy();
});
</script>

<template>
  <div
    ref="tooltipEl"
    v-if="tooltipState.visible"
    class="app-tooltip"
    role="tooltip"
  >
    <div class="app-tooltip__content" v-html="tooltipState.content"></div>
    <div ref="arrowEl" data-popper-arrow class="app-tooltip__arrow"></div>
  </div>
</template>

<style lang="scss" scoped>
.app-tooltip {
  background: var(--tooltip-bg, #333);
  color: var(--tooltip-text, #fff);
  padding: 4px 8px;
  border-radius: var(--border-radius, 4px);
  pointer-events: none;
  white-space: nowrap;
  z-index: 1000;
  font-size: 14px;
  position: fixed;
  top: 0;
  left: 0;

  &[data-popper-reference-hidden] {
    visibility: hidden;
    pointer-events: none;
  }
}

.app-tooltip__arrow,
.app-tooltip__arrow::before {
  position: absolute;
  width: 8px;
  height: 8px;
  background: inherit;
}

.app-tooltip__arrow {
  visibility: hidden;
}

.app-tooltip__arrow::before {
  visibility: visible;
  content: "";
  transform: rotate(45deg);
}

.app-tooltip[data-popper-placement^="top"] > .app-tooltip__arrow {
  bottom: -4px;
}

.app-tooltip[data-popper-placement^="bottom"] > .app-tooltip__arrow {
  top: -4px;
}
</style>
