<script>
import Loading from "@shell/components/Loading";
import CruResource from "@shell/components/CruResource";
import NameNsDescription from "@shell/components/form/NameNsDescription";
import Tabbed from "@shell/components/Tabbed";
import Tab from "@shell/components/Tabbed/Tab";
import CreateEditView from "@shell/mixins/create-edit-view";
import FormValidation from "@shell/mixins/form-validation";
import { _EDIT, _VIEW } from "@shell/config/query-params";
import { LONGHORN_NAMESPACE } from "@longhorn/types/longhorn";
import { bytesToGi } from "@longhorn/utils/formatter";
import { GiB_UNIT } from "@longhorn/types/units";

import Basics from "./Basics";
import Disks from "./Disks";

export default {
  name: "EditNode",
  components: {
    Loading,
    CruResource,
    NameNsDescription,
    Tabbed,
    Tab,
    Basics,
    Disks,
  },
  mixins: [CreateEditView, FormValidation],
  props: {
    mode: { type: String, default: _EDIT },
    value: { type: Object, required: true },
  },
  data() {
    return { _VIEW, LONGHORN_NAMESPACE, GiB_UNIT };
  },
  computed: {
    disks() {
      return this.value?.disks || [];
    },
    nodeConditions() {
      return this.mapConditions(this.value?.status?.conditions);
    },
  },
  methods: {
    bytesToGi,
    mapConditions(conditions = []) {
      if (!Array.isArray(conditions)) return [];
      return conditions.map(
        ({ type, status, error, transitioning, message }) => {
          const stateBackground = error
            ? "bg-error"
            : transitioning
            ? "bg-warning"
            : status === "True"
            ? "bg-success"
            : "bg-info";
          const icon = error
            ? "icon-error"
            : transitioning
            ? "icon-warning"
            : status === "True"
            ? "icon-checkmark"
            : "icon-info";
          return {
            key: type,
            tooltip: message,
            value: { stateBackground, stateDisplay: type },
            icon,
          };
        }
      );
    },
    async save(buttonDone) {
      try {
        await this.actuallySave();
        buttonDone(true);
        this.done();
      } catch (err) {
        this.errors = [err];
        buttonDone(false);
      }
    },
  },
};
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else>
    <CruResource
      :done-route="doneRoute"
      :mode="mode"
      :resource="value"
      :validation-passed="fvFormIsValid"
      :errors="fvUnreportedValidationErrors"
      @finish="save"
      @cancel="done"
    >
      <NameNsDescription
        :value="value"
        :mode="mode"
        :namespace-disabled="true"
        :name-hidden="mode !== _VIEW"
        :force-namespace="LONGHORN_NAMESPACE"
      />

      <Tabbed sideTabs :resource="value">
        <Tab name="basics" labelKey="longhorn.node.tab.basics">
          <Basics :mode="mode" :value="value" :conditions="nodeConditions" />
        </Tab>

        <Tab name="disk" labelKey="longhorn.node.tab.disks">
          <Disks
            :mode="mode"
            :disks="disks"
            :bytesToGi="bytesToGi"
            :GiB_UNIT="GiB_UNIT"
            :mapConditions="mapConditions"
          />
        </Tab>
      </Tabbed>
    </CruResource>
  </div>
</template>
