<script setup>
import { computed } from "vue";

const props = defineProps({
  value: {
    type: [String, Boolean],
    default: "",
  },
});

const displayValue = computed(() => {
  if (props.value === true) return "True";
  if (props.value === false) return "False";
  if (typeof props.value === "string") return props.value;
  return "";
});

const capitalized = computed(() => {
  const val = displayValue.value;
  if (!val) return "";
  return val.charAt(0).toUpperCase() + val.slice(1);
});
</script>

<template>
  <span>
    <span v-if="capitalized">{{ capitalized }}</span>
    <span v-else class="text-muted">&mdash;</span>
  </span>
</template>
