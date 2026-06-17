import { LONGHORN_RESOURCES, LONGHORN_SETTINGS } from '@longhorn/types/resources';
import { VOLUME_STATE } from '@longhorn/types/volume';
import { getVolumeStateQueryValue } from '@longhorn/utils/volume';
import { BADGE_COLOR } from '@longhorn/types/general';
import { resolveKubernetesStatus } from '@longhorn/utils/general';
import LonghornModel from './longhorn';

const BADGE = {
  ERROR: BADGE_COLOR.ERROR,
  WARNING: BADGE_COLOR.WARNING,
  SUCCESS: BADGE_COLOR.SUCCESS,
  DISABLED: BADGE_COLOR.DISABLED,
};

const STATE_DISPLAY_MAP = {
  creating: 'Creating',
  attached: 'Attached',
  detached: 'Detached',
  attaching: 'Attaching',
  detaching: 'Detaching',
  deleting: 'Deleting',
  faulted: 'Faulted',
  healthy: 'Healthy',
  degraded: 'Degraded',
};

const ROBUSTNESS = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  FAULTED: 'faulted',
  UNKNOWN: 'unknown',
};

const VOLUME_ACTION = {
  ATTACH: 'promptAttach',
  DETACH: 'detachVolume',
  SALVAGE: 'salvage',
  BACKEND_ACTIVATE: 'activate',
  BACKEND_ATTACH: 'attach',
  BACKEND_DETACH: 'detach',
  ENGINE_UPGRADE: 'engineUpgrade',
  TRIM_FILESYSTEM: 'trimFilesystem',
  PV_AND_PVC_CREATE: 'pvAndpvcCreate',
  BACKEND_PV_CREATE: 'pvCreate',
  BACKEND_PVC_CREATE: 'pvcCreate',
};

const MANUAL_ACTION_FILTERS = new Set([
  VOLUME_ACTION.BACKEND_ACTIVATE,
  VOLUME_ACTION.BACKEND_ATTACH,
  VOLUME_ACTION.BACKEND_DETACH,
  VOLUME_ACTION.SALVAGE,
  VOLUME_ACTION.ENGINE_UPGRADE,
  VOLUME_ACTION.TRIM_FILESYSTEM,
  VOLUME_ACTION.BACKEND_PV_CREATE,
  VOLUME_ACTION.BACKEND_PVC_CREATE,
]);

const VOLUME_DIALOG = {
  ATTACH: 'AttachVolumeDialog',
  SALVAGE: 'SalvageDialog',
  ENGINE_UPGRADE: 'EngineUpgradeDialog',
  CREATE_PV_AND_PVC: 'CreatePVAndPVCDialog',
};

export default class VolumeModel extends LonghornModel {
  static get STATES() {
    return {
      FAULTED: 'faulted',
      ATTACHED: 'attached',
      DETACHED: 'detached',
      HEALTHY: 'healthy',
      DEGRADED: 'degraded',
    };
  }

  get availableActions() {
    const out = this.backendAvailableActions;
    const isLocked = this.isStandby || this.isRestoring;
    const custom = [
      this.hasAttachAction && {
        action: VOLUME_ACTION.ATTACH,
        label: this.t('longhorn.volume.actions.attach'),
        icon: 'icon-plus',
        enabled: !this.isRestoring && this.state === VolumeModel.STATES.DETACHED,
      },
      this.hasDetachAction && {
        action: VOLUME_ACTION.DETACH,
        label: this.t('longhorn.volume.actions.detach'),
        icon: 'icon-minus',
        enabled: this.canDetach,
      },
      this.hasSalvageAction && {
        action: VOLUME_ACTION.SALVAGE,
        label: this.t('longhorn.volume.actions.salvage'),
        icon: 'icon-backup-restore',
        enabled: !this.isRestoring,
      },
      this.hasEngineUpgradeAction && {
        action: VOLUME_ACTION.ENGINE_UPGRADE,
        label: this.t('longhorn.volume.actions.engineUpgrade'),
        icon: 'icon-upgrade-alt',
        enabled: this.canEngineUpgrade,
      },
      {
        action: VOLUME_ACTION.PV_AND_PVC_CREATE,
        label: this.t('longhorn.volume.actions.createPvPvc'),
        icon: 'icon-storage',
        enabled: this.canCreatePvAndPvc,
      },
      {
        action: VOLUME_ACTION.TRIM_FILESYSTEM,
        label: this.t('longhorn.volume.actions.trimFilesystem'),
        icon: 'icon-file',
        enabled: this.canTrimFilesystem,
      },
    ].filter(Boolean);

    const baseActions = out.filter((action) => !MANUAL_ACTION_FILTERS.has(action.action));

    return this.sanitizeAvailableActions([
      ...custom,
      ...baseActions.map((action) => {
        const cloned = { ...action };

        switch (cloned.action) {
          case 'cloneYaml':
            cloned.enabled = !isLocked;
            break;
          case 'goToEditYaml':
          case 'goToEdit':
            if (this.isFaulted) cloned.enabled = false;
            break;
        }

        return cloned;
      }),
    ]);
  }

  openVolumeDialog(component, componentProps = {}) {
    this.$dispatch('promptModal', {
      resources: [this],
      component,
      componentProps,
    });
  }

  openActionConfirmDialog({ title, message, confirmLabel, confirmButtonClass, onConfirm }) {
    this.$dispatch('promptModal', {
      component: 'ActionConfirmDialog',
      componentProps: {
        title,
        message,
        confirmLabel,
        confirmButtonClass,
        onConfirm,
      },
    });
  }

  async promptAttach() {
    const inStore = this.inStore;

    if (!inStore) {
      this.openVolumeDialog(VOLUME_DIALOG.ATTACH);

      return;
    }

    try {
      const initialNodes = await this.$dispatch(
        `${inStore}/findAll`,
        { type: LONGHORN_RESOURCES.NODES },
        { root: true }
      );

      if (initialNodes.length > 0) {
        this.openVolumeDialog(VOLUME_DIALOG.ATTACH, { initialNodes });
      } else {
        this.openVolumeDialog(VOLUME_DIALOG.ATTACH);
      }
    } catch {
      // If fetch fails, open dialog without initial nodes
      this.openVolumeDialog(VOLUME_DIALOG.ATTACH);
    }
  }

  async detachVolume() {
    const detachTargets = (this.attachmentRows || [])
      .map((row) => ({
        attachmentID: row?.attachmentID || '',
        hostId: row?.nodeID && row.nodeID !== '—' ? row.nodeID : '',
      }))
      .filter((target) => !!target.attachmentID);

    if (!detachTargets.length) {
      await this.doAction('detach', {
        attachmentID: '',
        hostId: '',
        forceDetach: true,
      });

      return;
    }

    await Promise.all(
      detachTargets.map((target) =>
        this.doAction('detach', {
          attachmentID: target.attachmentID,
          hostId: target.hostId,
          forceDetach: false,
        })
      )
    );
  }

  engineUpgrade() {
    this.openVolumeDialog(VOLUME_DIALOG.ENGINE_UPGRADE);
  }

  salvage() {
    const replicas = (this.status?.replicas || []).filter((replica) => !!replica?.name);

    if (!replicas.length) {
      throw new Error(this.t('longhorn.volume.dialog.confirm.errors.noReplicaForSalvage'));
    }

    this.openVolumeDialog(VOLUME_DIALOG.SALVAGE, { replicas });
  }

  trimFilesystem() {
    this.openActionConfirmDialog({
      title: this.t('longhorn.volume.dialog.confirm.trimFilesystem.title'),
      message: this.t('longhorn.volume.dialog.confirm.trimFilesystem.message', {
        name: this.metadata?.name || this.id,
      }),
      confirmLabel: this.t('longhorn.volume.dialog.confirm.trimFilesystem.confirm'),
      onConfirm: async () => {
        await this.doAction('trimFilesystem');
      },
    });
  }

  pvAndpvcCreate() {
    this.openVolumeDialog(VOLUME_DIALOG.CREATE_PV_AND_PVC);
  }

  get _canEdit() {
    return !this.isFaulted && super._canEdit;
  }

  get robustness() {
    return this.status?.robustness?.toLowerCase() || ROBUSTNESS.UNKNOWN;
  }

  get state() {
    return this.status?.state?.toLowerCase() || '';
  }

  get isFaulted() {
    return this.robustness === ROBUSTNESS.FAULTED;
  }

  get isAttached() {
    return this.state === VolumeModel.STATES.ATTACHED;
  }

  get isStandby() {
    return !!(this.status?.isStandby || this.spec?.standby);
  }

  get isRestoring() {
    return this.status?.restoreStatus?.some((item) => item?.isRestoring) ?? false;
  }

  get isEngineUpgrading() {
    const desiredImage = this.spec?.image || '';
    const currentImage = this.status?.currentImage || '';

    return !!desiredImage && !!currentImage && desiredImage !== currentImage;
  }

  get canDetach() {
    if (this.isStandby || this.isRestoring) {
      return false;
    }

    if (this.spec?.accessMode === 'rwx') {
      if (this.spec?.migratable) {
        return this.state === VolumeModel.STATES.ATTACHED && (this.controllers || []).length <= 1;
      }

      return this.state === VolumeModel.STATES.ATTACHED && !!this.disableFrontend;
    }

    return this.state === VolumeModel.STATES.ATTACHED;
  }

  get canCreatePvAndPvc() {
    const kubernetesStatus = this.kubernetesStatus || {};

    if (kubernetesStatus.pvcName && !kubernetesStatus.lastPVCRefAt) {
      return false;
    }

    if (this.isFaulted || this.isStandby || this.isRestoring) {
      return false;
    }

    if (['attaching', 'detaching'].includes(this.state)) {
      return false;
    }

    const hasPvCreateAction = !!this.actionLinkFor(VOLUME_ACTION.BACKEND_PV_CREATE);
    const hasPvcCreateAction = !!this.actionLinkFor(VOLUME_ACTION.BACKEND_PVC_CREATE);

    return hasPvCreateAction && hasPvcCreateAction;
  }

  get canTrimFilesystem() {
    return this.state === VolumeModel.STATES.ATTACHED;
  }

  get hasAttachAction() {
    return !!this.actionLinkFor(VOLUME_ACTION.BACKEND_ATTACH) || !!this.actionLinkFor(VOLUME_ACTION.BACKEND_ACTIVATE);
  }

  get hasDetachAction() {
    return !!this.actionLinkFor(VOLUME_ACTION.BACKEND_DETACH);
  }

  get hasSalvageAction() {
    return !!this.actionLinkFor(VOLUME_ACTION.SALVAGE);
  }

  get hasEngineUpgradeAction() {
    return !!this.actionLinkFor(VOLUME_ACTION.ENGINE_UPGRADE);
  }

  get hasEngineUpgradeAvailable() {
    if (this.spec?.dataEngine === 'v2' || this.isEngineUpgrading) {
      return false;
    }

    const currentImage = this.status?.currentImage || '';
    const defaultEngineImage = this.defaultEngineImageSetting?.value || '';

    if (!currentImage || !defaultEngineImage || defaultEngineImage === currentImage) {
      return false;
    }

    const state = this.state;
    const robustness = this.robustness;

    return (
      (state === VolumeModel.STATES.ATTACHED && robustness === ROBUSTNESS.HEALTHY) ||
      (state === VolumeModel.STATES.DETACHED && robustness !== ROBUSTNESS.FAULTED)
    );
  }

  get canEngineUpgrade() {
    if (!this.hasEngineUpgradeAction) {
      return false;
    }

    if (this.isRestoring || !this.hasEngineUpgradeAvailable) {
      return false;
    }

    const desiredImage = this.spec?.image || '';

    const automaticUpgradeLimit = this.concurrentAutomaticEngineUpgradePerNodeLimitSetting?.value;
    const defaultEngineImage = this.defaultEngineImageSetting?.value;

    if (
      automaticUpgradeLimit &&
      automaticUpgradeLimit !== '0' &&
      defaultEngineImage &&
      desiredImage === defaultEngineImage
    ) {
      return false;
    }

    return true;
  }

  get displayState() {
    const { state } = this;

    // Simply capitalize the state, similar to longhorn-ui's text.hyphenToHump()
    return STATE_DISPLAY_MAP[state] || state.charAt(0).toUpperCase() + state.slice(1);
  }

  get readyStatus() {
    if (this.isFaulted) {
      return { ready: false, msg: 'Volume is faulted.' };
    }

    if (this.status?.restoreRequired) {
      return { ready: false, msg: 'Restoration required.' };
    }

    const scheduledCondition = this.status?.conditions?.find(
      (condition) => condition.type?.toLowerCase() === 'scheduled'
    );
    const isScheduled = scheduledCondition?.status?.toLowerCase() === 'true';

    if (this.state === VolumeModel.STATES.DETACHED && !isScheduled) {
      return { ready: false, msg: 'Insufficient resources to schedule.' };
    }

    return { ready: true };
  }

  get isDataLocalityNotMet() {
    if (this.spec?.dataLocality !== 'best-effort' || !this.isAttached) return false;
    const attachedNodeId = this.status?.currentNodeID || '';

    return (this.status?.replicas || []).every((replica) => replica.hostID !== attachedNodeId);
  }

  get stateDisplay() {
    return this.volumeStatus?.stateDisplay || this.getDisplayForState('unknown');
  }

  get stateBackground() {
    return this.volumeStatus?.stateBackground || this.getBackgroundForState('unknown');
  }

  get stateObj() {
    return this.buildStateObj(this.metadata?.state || {});
  }

  get volumeStatus() {
    const { state, robustness } = this;

    // Reference: longhorn-ui VolumeList.js stateText logic
    // Priority: stable state combinations > restoring > transitional states

    // Restoring state
    if (this.isRestoring) {
      return { stateDisplay: 'Restoring', stateBackground: BADGE.WARNING, message: '' };
    }

    // Stable state combinations (only show robustness in these specific cases)
    if (state === VolumeModel.STATES.ATTACHED && robustness === ROBUSTNESS.HEALTHY) {
      return { stateDisplay: 'Healthy', stateBackground: BADGE.SUCCESS, message: '' };
    }

    if (state === VolumeModel.STATES.ATTACHED && robustness === ROBUSTNESS.DEGRADED) {
      return { stateDisplay: 'Degraded', stateBackground: BADGE.WARNING, message: '' };
    }

    if (state === VolumeModel.STATES.DETACHED && robustness === ROBUSTNESS.FAULTED) {
      return { stateDisplay: 'Faulted', stateBackground: BADGE.ERROR, message: '' };
    }

    // All other cases: use state (detached, attaching, detaching, creating, deleting)
    return { stateDisplay: this.displayState, stateBackground: BADGE.DISABLED, message: '' };
  }

  // Keep dashboard metric labels and list query filtering in sync.
  get dashboardStateDisplay() {
    const { state, robustness } = this;

    if (state === VolumeModel.STATES.DETACHED && robustness === ROBUSTNESS.FAULTED) {
      return VOLUME_STATE.FAULTED;
    }

    if (state === VolumeModel.STATES.ATTACHED && robustness === ROBUSTNESS.DEGRADED) {
      return VOLUME_STATE.DEGRADED;
    }

    if (state === VolumeModel.STATES.ATTACHED && robustness === ROBUSTNESS.HEALTHY) {
      return VOLUME_STATE.HEALTHY;
    }

    if (state === VolumeModel.STATES.DETACHED) {
      return VOLUME_STATE.DETACHED;
    }

    return VOLUME_STATE.IN_PROGRESS;
  }

  // Legacy longhorn-ui style query value used by dashboard volume status filtering.
  get dashboardStateQueryValue() {
    return getVolumeStateQueryValue(this.dashboardStateDisplay);
  }

  // Space-delimited host IDs used for simple table filtering by replica location.
  get replicaNodeIds() {
    const replicas = this.status?.replicas || [];
    const nodeIds = replicas.map((replica) => replica?.hostID).filter((id) => !!id);

    return [...new Set(nodeIds)].join(' ');
  }

  get kubernetesStatus() {
    const metadataLabels = this.labels || this.metadata?.labels || {};

    return resolveKubernetesStatus({
      value: this.status?.kubernetesStatus,
      statusLabels: this.status?.labels,
      metadataLabels,
    });
  }

  get inStore() {
    return this.$rootGetters['currentProduct']?.inStore;
  }

  get backendAvailableActions() {
    return super._availableActions || [];
  }

  getSettingById(settingId) {
    if (!this.inStore) {
      return null;
    }

    return this.$rootGetters[`${this.inStore}/byId`](LONGHORN_RESOURCES.SETTINGS, settingId) || null;
  }

  get defaultEngineImageSetting() {
    return this.getSettingById(LONGHORN_SETTINGS.DEFAULT_ENGINE_IMAGE);
  }

  get concurrentAutomaticEngineUpgradePerNodeLimitSetting() {
    return this.getSettingById(LONGHORN_SETTINGS.CONCURRENT_AUTOMATIC_ENGINE_UPGRADE_PER_NODE_LIMIT);
  }

  get volumeAttachments() {
    if (!this.inStore) return [];

    return (this.$rootGetters[`${this.inStore}/all`](LONGHORN_RESOURCES.VOLUME_ATTACHMENTS) || []).filter(
      (volumeAttachment) => volumeAttachment.volumeName === this.metadata.name
    );
  }

  get attachmentRows() {
    return this.volumeAttachments.flatMap((volumeAttachment) => volumeAttachment.ticketRows || []);
  }
}
