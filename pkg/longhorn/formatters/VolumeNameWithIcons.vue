<script>
export default {
  name: 'VolumeNameWithIcons',

  props: {
    row: {
      type: Object,
      required: true,
    },
  },

  computed: {
    to() {
      return this.row?.detailLocation || null;
    },

    isEncrypted() {
      return !!this.row.spec?.encrypted;
    },

    isDRVolume() {
      return !!this.row.isStandby;
    },

    isDRVolumeRestoring() {
      if (!this.row.isStandby) {
        return false;
      }

      const restoreStatus = this.row.status?.restoreStatus || [];

      return restoreStatus.some((status) => status.isRestoring);
    },

    volumeName() {
      return this.row.nameDisplay || this.row.metadata?.name || '';
    },
  },
};
</script>

<template>
  <div class="volume-name-with-icons">
    <div class="icon-area">
      <i v-if="isEncrypted" v-tooltip="t('longhorn.volume.encrypted')" class="icon icon-lock" />
      <i
        v-if="isDRVolumeRestoring"
        v-tooltip="t('longhorn.volume.drVolumeRestoring')"
        class="icon icon-spinner icon-spin"
      />
      <i v-else-if="isDRVolume" v-tooltip="t('longhorn.volume.drVolume')" class="icon icon-archive" />
    </div>
    <router-link v-if="to" :to="to">
      {{ volumeName }}
    </router-link>
    <span v-else>
      {{ volumeName }}
    </span>
  </div>
</template>

<style lang="scss" scoped>
.volume-name-with-icons {
  display: flex;
  align-items: center;
  gap: 5px;

  .icon-area {
    display: flex;
    align-items: center;
    gap: 5px;

    .icon {
      flex-shrink: 0;
    }
  }
}
</style>
