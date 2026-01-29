<script setup>
import Tag from '@shell/components/Tag';

const props = defineProps({
  value: {
    type: Array,
    required: true,
  },
});
</script>

<template>
  <div class="tag-container">
    <template v-if="props.value && props.value.length">
      <Tag v-for="(item, index) in props.value" :key="index">
        {{ item }}
      </Tag>
    </template>
    <template v-else>
      <div class="text-muted">&mdash;</div>
    </template>
  </div>
</template>

<style scoped>
.tag-container {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
</style>
