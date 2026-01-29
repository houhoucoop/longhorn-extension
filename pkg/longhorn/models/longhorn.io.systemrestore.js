import LonghornModel from "./longhorn";
import { AVAILABLE_ACTIONS } from "@longhorn/types/longhorn";
import { LONGHORN_RESOURCES } from "@longhorn/types/resources";

export default class SystemRestoreModel extends LonghornModel {
  get availableActions() {
    const out = super._availableActions;
    const forbiddenActions = [AVAILABLE_ACTIONS.CLONE_YAML];

    return out.filter((item) => !forbiddenActions.includes(item.action));
  }

  get version() {
    const backupName = this.spec?.systemBackup;

    if (!backupName) return "";

    const systemBackups =
      this.$getters?.["all"]?.(LONGHORN_RESOURCES.SYSTEM_BACKUPS) || [];
    const matchingBackup = systemBackups.find(
      (backup) => backup.metadata?.name === backupName,
    );

    return matchingBackup?.status?.version || "";
  }
}
