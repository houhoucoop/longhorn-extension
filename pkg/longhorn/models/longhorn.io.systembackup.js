import LonghornModel from "./longhorn";
import { AVAILABLE_ACTIONS } from "@longhorn/types/longhorn";

export default class SystemBackupModel extends LonghornModel {
  get availableActions() {
    const out = super._availableActions;
    const forbiddenActions = [
      AVAILABLE_ACTIONS.CLONE_YAML,
      AVAILABLE_ACTIONS.EDIT_YAML
    ];
    const filtered = out.filter((item) => !forbiddenActions.includes(item.action));
    const firstDividerIndex = filtered.findIndex(item => item.divider);

    const restoreAction = {
      action:  'restore',
      enabled: true,
      icon:    'icon icon-backup-restore',
      label:   'Restore'
    };

    if (firstDividerIndex !== -1) {
      filtered.splice(firstDividerIndex + 1, 0, restoreAction);
    } else {
      filtered.push(restoreAction);
    }

    return filtered;
  }

  restore(resources = this) {
    this.$dispatch('promptModal', {
      resources,
      component: 'SystemBackupRestore',
    });
  }
}
