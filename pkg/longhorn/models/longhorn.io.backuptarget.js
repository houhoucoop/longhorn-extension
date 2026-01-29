import LonghornModel from "./longhorn";
import { AVAILABLE_ACTIONS } from "@longhorn/types/longhorn";

export default class BackupTargetModel extends LonghornModel {
  get availableActions() {
    const out = super._availableActions;
    const forbiddenActions = [AVAILABLE_ACTIONS.CLONE];

    if (this.metadata?.name === "default") {
      forbiddenActions.push(AVAILABLE_ACTIONS.DELETE);
    }

    return out.filter((item) => !forbiddenActions.includes(item.action));
  }
}
