<script setup>
import { computed } from "vue";
import ConsumptionGauge from "@shell/components/ConsumptionGauge";
import { bytesToGi } from "@longhorn/utils/formatter";
import { GiB_UNIT } from "@longhorn/types/units";

const props = defineProps({
  value: {
    type: Object,
    required: true,
  },
});

const capacity = computed(() => bytesToGi(props.value?.capacity || 0));
const used = computed(() => bytesToGi(props.value?.used || 0));
</script>

<template>
  <ConsumptionGauge :capacity="capacity" :used="used" :units="GiB_UNIT" />
</template>
