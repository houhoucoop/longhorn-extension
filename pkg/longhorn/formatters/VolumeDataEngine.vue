<script>
export default {
  name: 'VolumeDataEngine',

  props: {
    row: {
      type: Object,
      required: true,
    },
    value: {
      type: String,
      default: '',
    },
  },

  computed: {
    dataEngine() {
      return this.value || this.row.spec?.dataEngine || '';
    },

    displayText() {
      // Show data engine type and version if available
      if (this.dataEngine) {
        return this.dataEngine.toUpperCase();
      }

      return '-';
    },
  },
};
</script>

<template>
  <div class="volume-data-engine">
    <span>{{ displayText }}</span>
  </div>
</template>

<style lang="scss" scoped>
.volume-data-engine {
  display: flex;
  align-items: center;
  justify-content: center;

  .icon {
    flex-shrink: 0;
  }
}
</style>
