<script>
import Loading from "@shell/components/Loading";
import NameNsDescription from "@shell/components/form/NameNsDescription";
import LabelValue from "@shell/components/LabelValue";
import Tabbed from "@shell/components/Tabbed";
import Tab from "@shell/components/Tabbed/Tab";
import { _VIEW } from "@shell/config/query-params";
import { LONGHORN_NAMESPACE } from "../types/longhorn";
import { LONGHORN_RESOURCES, LONGHORN_RESOURCE_IDS } from "../types/resources";

export default {
  name: "DetailEngineImage",

  components: {
    Loading,
    NameNsDescription,
    Tabbed,
    Tab,
    LabelValue,
  },

  props: {
    mode: {
      type: String,
      default: _VIEW,
    },
    value: {
      type: Object,
      required: false,
    },
  },

  async fetch() {
    const inStore = this.$store.getters["currentProduct"].inStore;
    await this.$store.dispatch(`${inStore}/find`, {
      type: LONGHORN_RESOURCES.SETTINGS,
      id: LONGHORN_RESOURCE_IDS.DEFAULT_ENGINE_IMAGE,
    });
  },

  data() {
    return {
      LONGHORN_NAMESPACE,
      _VIEW,
    };
  },

  computed: {
    nodeDeploymentMap() {
      if (!this.value?.status?.nodeDeploymentMap) {
        return [];
      }

      return Object.entries(this.value.status.nodeDeploymentMap)
        .filter(([key, val]) => val === true)
        .map(([key]) => key)
        .join(", ");
    },
  },
};
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else>
    <NameNsDescription
      :value="value"
      :mode="mode"
      :namespace-disabled="true"
      :name-hidden="mode !== _VIEW"
      :description-hidden="true"
      :force-namespace="LONGHORN_NAMESPACE"
    />
    <Tabbed sideTabs :resource="value">
      <Tab name="basics" labelKey="longhorn.engineImage.tab.basics">
        <LabelValue
          :name="t('longhorn.engineImage.fields.image')"
          :value="value.spec.image"
        />
        <LabelValue
          :name="t('longhorn.engineImage.fields.status')"
          :value="value.status.state"
        />
        <LabelValue
          :name="t('longhorn.engineImage.fields.default')"
          :value="`${value.isDefault}`"
        />
        <LabelValue
          :name="t('longhorn.engineImage.fields.refCount')"
          :value="value.status.refCount"
        />
        <LabelValue
          :name="t('longhorn.engineImage.fields.buildDate')"
          :value="value.status.buildDate"
        />
        <LabelValue
          :name="t('longhorn.engineImage.fields.cliAPIVersion')"
          :value="value.status.cliAPIVersion"
        />
        <LabelValue
          :name="t('longhorn.engineImage.fields.controllerAPIVersion')"
          :value="value.status.controllerAPIVersion"
        />
        <LabelValue
          :name="t('longhorn.engineImage.fields.noRefSince')"
          :value="value.status.noRefSince || '-'"
        />
        <LabelValue
          :name="t('longhorn.engineImage.fields.nodeDeploymentMap')"
          :value="nodeDeploymentMap"
        />
      </Tab>
    </Tabbed>
  </div>
</template>

<style lang="scss" scoped>
.label {
  margin-bottom: 20px;
}
</style>
