<script>
import { LONGHORN_RESOURCES } from '@longhorn/types/resources';

export default {
  name: 'VolumeWarnings',

  props: {
    row: {
      type: Object,
      required: true,
    },
  },

  computed: {
    warnings() {
      const warnings = [];

      // Common variables
      const state = this.row.state || '';
      const robustness = this.row.status?.robustness || '';
      const controllers = this.row.status?.controllers || this.row.controllers || [];
      const attachedNodeId = controllers[0]?.hostId || '';

      // 1. Not Ready warning (icon-error, red)
      // Reference: longhorn-ui VolumeList.js - only show in stable state combinations
      const readyStatus = this.row.readyStatus || {};
      const isStableState =
        (state === 'attached' && (robustness === 'healthy' || robustness === 'degraded')) ||
        (state === 'detached' && robustness === 'faulted');

      if (!readyStatus.ready && isStableState) {
        warnings.push({
          icon: 'icon-error',
          tooltip: readyStatus.msg || this.t('longhorn.volume.notReady'),
          color: 'text-error',
        });
      }

      // 2. Unscheduled warning (icon-notify-info)
      const conditions = this.row.status?.conditions || [];
      const scheduledCondition = conditions.find((c) => c.type === 'Scheduled');

      if (scheduledCondition?.status === 'False') {
        warnings.push({
          icon: 'icon-notify-info',
          tooltip: this.t('longhorn.volume.unscheduled'),
          color: 'text-info',
        });
      }

      // 3. Node Down warning (icon-disconnect)
      // Reference: longhorn-ui VolumeList.js attachedNodeIsDown logic

      if (state === 'attached' && robustness === 'unknown' && attachedNodeId) {
        const allNodes = this.$store.getters['cluster/all'](LONGHORN_RESOURCES.NODES) || [];
        const attachedNode = allNodes.find((node) => node.id === attachedNodeId);
        const readyCondition = attachedNode?.status?.conditions?.find((c) => c.type === 'Ready');

        if (readyCondition?.status === 'False') {
          warnings.push({
            icon: 'icon-disconnect',
            tooltip: this.t('longhorn.volume.nodeDown', { node: attachedNodeId }),
            color: 'text-error',
          });
        }
      }

      // 4. HA Danger/Warning
      // Reference: longhorn-ui/src/utils/filter.js isVolumeReplicaNotRedundancy, isVolumeRelicaLimited
      const allReplicas = this.row.status?.replicas || this.row.replicas || [];
      const validReplicas = allReplicas.filter((r) => !r.failedAt || r.failedAt === '');
      const numberOfReplicas = validReplicas.length;

      if (numberOfReplicas > 1) {
        const volumeNodeReplicas = validReplicas.reduce((total, current) => {
          const replicas = total[current.hostId] || [];

          replicas.push(current);
          total[current.hostId] = replicas;

          return total;
        }, {});

        const nodeCount = Object.keys(volumeNodeReplicas).length;
        const allHaveHostId = validReplicas.every((r) => r.hostId && r.hostId !== '');

        if (allHaveHostId) {
          if (nodeCount === 1) {
            // HA Danger: all replicas on same node
            warnings.push({
              icon: 'icon-warning',
              tooltip: this.t('longhorn.volume.haDanger'),
              color: 'text-error',
            });
          } else if (nodeCount > 0 && nodeCount < numberOfReplicas) {
            // HA Warning: some replicas share nodes
            warnings.push({
              icon: 'icon-warning',
              tooltip: this.t('longhorn.volume.haWarning'),
              color: 'text-warning',
            });
          }
        }
      }

      // 5. Data Locality warning
      // Reference: longhorn-ui VolumeList.js dataLocalityWarn logic
      const dataLocality = this.row.spec?.dataLocality;
      const isAttached = state === 'attached';

      if (dataLocality === 'best-effort' && isAttached && attachedNodeId) {
        const replicas = this.row.status?.replicas || this.row.replicas || [];
        const noReplicaOnAttachedNode = replicas.every((r) => r.hostId !== attachedNodeId);

        if (noReplicaOnAttachedNode && replicas.length > 0) {
          warnings.push({
            icon: 'icon-warning',
            tooltip: this.t('longhorn.volume.dataLocalityNotMet'),
            color: 'text-warning',
          });
        }
      }

      // 6. Engine Upgrade Available
      if (this.row.hasEngineUpgradeAvailable) {
        warnings.push({
          icon: 'icon-upgrade-alt',
          tooltip: this.t('longhorn.volume.engineUpgradeAvailable'),
          color: 'text-info',
        });
      }

      return warnings;
    },
  },
};
</script>

<template>
  <div class="volume-warnings">
    <i
      v-for="(warning, index) in warnings"
      :key="index"
      v-tooltip="warning.tooltip"
      :class="['icon', warning.icon, warning.color, { 'ml-5': index > 0 }]"
    />
  </div>
</template>

<style lang="scss" scoped>
.volume-warnings {
  display: flex;
  align-items: center;
  justify-content: flex-start;

  .icon {
    flex-shrink: 0;
  }
}
</style>
