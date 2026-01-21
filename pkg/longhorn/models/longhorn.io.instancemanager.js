import LonghornModel from "./longhorn";

export default class InstanceManagerModel extends LonghornModel {
  get availableActions() {
    const out = super._availableActions;
    const forbiddenActions = ["cloneYaml"];
    return out.filter((item) => !forbiddenActions.includes(item.action));
  }
}
