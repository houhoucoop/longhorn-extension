import LonghornModel from './longhorn';
import { AVAILABLE_ACTIONS } from '@longhorn/types/longhorn';

export default class InstanceManagerModel extends LonghornModel {
  get availableActions() {
    const out = super._availableActions;
    const forbiddenActions = [AVAILABLE_ACTIONS.CLONE_YAML];

    return out.filter((item) => !forbiddenActions.includes(item.action));
  }
}
