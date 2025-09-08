import LonghornModel from "./longhorn";
import { AVAILABLE_ACTIONS } from "../types/longhorn";
import { LONGHORN_RESOURCES, LONGHORN_RESOURCE_IDS } from "../types/resources";

export default class EngineImageModel extends LonghornModel {
  get availableActions() {
    const out = super._availableActions
      .filter((action) => ![AVAILABLE_ACTIONS.CLONE].includes(action.action))
      .map((action) => {
        if (action.action === AVAILABLE_ACTIONS.DELETE) {
          return { ...action, enabled: !this.isDefault };
        }
        return action;
      });

    return out;
  }

  get isDefault() {
    const defaultEngineImageSetting = this.$getters?.["byId"]?.(
      LONGHORN_RESOURCES.SETTINGS,
      LONGHORN_RESOURCE_IDS.DEFAULT_ENGINE_IMAGE
    );

    const defaultEngineImage = defaultEngineImageSetting?.value;

    return this.spec?.image && defaultEngineImage
      ? this.spec.image === defaultEngineImage
      : false;
  }
}
