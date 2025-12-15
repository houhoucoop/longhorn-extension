<script lang="ts">
import Loading from "@shell/components/Loading";
import NameNsDescription from "@shell/components/form/NameNsDescription";
import LabelValue from "@shell/components/LabelValue";
import Tabbed from "@shell/components/Tabbed";
import Tab from "@shell/components/Tabbed/Tab";
import { _VIEW } from "@shell/config/query-params";
import { LONGHORN_NAMESPACE } from "../constants/longhorn";
import { LONGHORN_RESOURCES, LONGHORN_RESOURCE_IDS } from "../constants/resources";
import { EngineImage } from "@longhorn/types/engineImages";

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
      type: Object as () => EngineImage,
      required: false,
      default: () => ({}),
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
      const map = this.value?.status?.nodeDeploymentMap;
      if (!map) return "-";

      const result = Object.entries(map)
        .filter(([, val]) => val === true)
        .map(([key]) => key)
        .join(", ");

      return this.displayValue(result);
    },
  },

  methods: {
    displayValue(val) {
      return val === null || val === undefined || String(val).trim() === ""
        ? "-"
        : val;
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
          :value="displayValue(value?.spec?.image)"
        />
        <LabelValue
          :name="t('longhorn.engineImage.fields.status')"
          :value="displayValue(value?.status?.state)"
        />
        <LabelValue
          :name="t('longhorn.engineImage.fields.default')"
          :value="displayValue(`${value?.isDefault}`)"
        />
        <LabelValue
          :name="t('longhorn.engineImage.fields.refCount')"
          :value="displayValue(value?.status?.refCount)"
        />
        <LabelValue
          :name="t('longhorn.engineImage.fields.buildDate')"
          :value="displayValue(value?.status?.buildDate)"
        />
        <LabelValue
          :name="t('longhorn.engineImage.fields.cliAPIVersion')"
          :value="displayValue(value?.status?.cliAPIVersion)"
        />
        <LabelValue
          :name="t('longhorn.engineImage.fields.controllerAPIVersion')"
          :value="displayValue(value?.status?.controllerAPIVersion)"
        />
        <LabelValue
          :name="t('longhorn.engineImage.fields.noRefSince')"
          :value="displayValue(value?.status?.noRefSince)"
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
