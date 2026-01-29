import LonghornModel from '../longhorn';
import { LONGHORN_RESOURCES, LONGHORN_SETTINGS } from '@longhorn/types/resources';
import { AVAILABLE_ACTIONS } from '@longhorn/types/longhorn';

export default class NodeModel extends LonghornModel {
  get _availableActions() {
    const out = super._availableActions || [];

    out.forEach((a) => {
      if (a.action === AVAILABLE_ACTIONS.EDIT) {
        a.enabled = !this.isDown;
      } else if (a.action === AVAILABLE_ACTIONS.DELETE) {
        a.enabled = this.isDown;
      }
    });

    return out;
  }

  get isDown() {
    const readyCondition = (this.status?.conditions || []).find((c) => c.type === 'Ready');

    return readyCondition?.status?.toLowerCase() === 'false';
  }

  get disks() {
    const specDisks = this.spec?.disks || {};
    const statusMap = this.status?.diskStatus || {};

    return Object.entries(specDisks).map(([id, specDisk]) => {
      const statusDisk = statusMap[id] || {};

      const scheduledReplicaCounts = {
        text: Object.keys(statusDisk.scheduledReplica || {}).length,
        to: 'dsads',
      };

      const diskAllocated = {
        used: statusDisk.storageScheduled || 0,
        capacity: statusDisk.storageMaximum || 0,
      };

      const diskUsed = {
        used: (statusDisk.storageMaximum || 0) - (statusDisk.storageAvailable || 0),
        capacity: statusDisk.storageMaximum || 0,
      };

      const diskSize = {
        reserved: specDisk.storageReserved || 0,
        capacity: (statusDisk.storageMaximum || 0) - (specDisk.storageReserved || 0),
      };

      return {
        id,
        ...specDisk,
        ...statusDisk,
        scheduledReplicaCounts,
        diskAllocated,
        diskUsed,
        diskSize,
      };
    });
  }

  get replicas() {
    const total = this.disks.reduce((sum, disk) => sum + (disk.scheduledReplicaCounts?.text || 0), 0);

    return { text: total, to: 'dsadas' };
  }

  get storageOverProvisioningPercentage() {
    const setting = this.$getters?.['byId']?.(
      LONGHORN_RESOURCES.SETTINGS,
      LONGHORN_SETTINGS.STORAGE_OVER_PROVISIONING_PERCENTAGE
    );

    return Number(setting?.value || 100);
  }

  sumBy(keyOrFn) {
    return this.disks.reduce((total, disk) => {
      if (typeof keyOrFn === 'function') return total + keyOrFn(disk);

      return total + (disk[keyOrFn] || 0);
    }, 0);
  }

  get totalDiskCapacity() {
    const max = this.sumBy((d) => d.storageMaximum || 0);
    const reserved = this.sumBy((d) => d.storageReserved || 0);

    return ((max - reserved) * this.storageOverProvisioningPercentage) / 100;
  }

  get disksAllocated() {
    const used = this.sumBy((d) => d.storageScheduled || 0);
    const capacity = this.totalDiskCapacity;

    return { used, capacity };
  }

  get disksUsed() {
    const used = this.sumBy((d) => (d.storageMaximum || 0) - (d.storageAvailable || 0));
    const capacity = this.sumBy((d) => d.storageMaximum || 0);

    return { used, capacity };
  }

  get disksSize() {
    const reserved = this.sumBy((d) => d.storageReserved || 0);
    const capacity = this.sumBy((d) => (d.storageMaximum || 0) - (d.storageReserved || 0));

    return { reserved, capacity };
  }
}
