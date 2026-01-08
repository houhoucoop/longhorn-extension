<script>
import Loading from "@shell/components/Loading";
import CruResource from "@shell/components/CruResource";
import NameNsDescription from "@shell/components/form/NameNsDescription";
import { RadioGroup } from "@components/Form/Radio";
import UnitInput from "@shell/components/form/UnitInput.vue";
import { LabeledInput } from "@components/Form/LabeledInput";
import Tabbed from "@shell/components/Tabbed";
import Tab from "@shell/components/Tabbed/Tab";
import Tag from "@shell/components/Tag";
import InfoBox from "@shell/components/InfoBox";
import ArrayList from "@shell/components/form/ArrayList";
import LabelValue from "@shell/components/LabelValue";
import { BadgeState } from "@components/BadgeState";
import CreateEditView from "@shell/mixins/create-edit-view";
import FormValidation from "@shell/mixins/form-validation";
import { _EDIT, _VIEW } from "@shell/config/query-params";
import { LONGHORN_NAMESPACE } from "@longhorn/types/longhorn";
import { bytesToGi } from "@longhorn/utils/formatter";
import { GiB_UNIT } from "@longhorn/types/units";

export default {
  name: "EditNode",

  components: {
    Loading,
    CruResource,
    NameNsDescription,
    Tabbed,
    Tab,
    RadioGroup,
    UnitInput,
    Tag,
    ArrayList,
    BadgeState,
    LabeledInput,
    InfoBox,
    LabelValue,
  },

  mixins: [CreateEditView, FormValidation],

  props: {
    mode: {
      type: String,
      default: _EDIT,
    },
    value: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      _VIEW,
      LONGHORN_NAMESPACE,
      GiB_UNIT,
      fvFormRuleSets: [],
    };
  },

  methods: {
    bytesToGi,

    onError(errors) {
      this.errors = Array.isArray(errors) ? errors : [errors];
    },

    async save(buttonDone) {
      try {
        // CruResource finish event expects buttonDone(true) on success
        this.errors = [];
        await this.actuallySave();
        buttonDone(true);
        this.done();
      } catch (err) {
        this.errors = [err];
        buttonDone(false);
      }
    },

    mapConditions(conditions = []) {
      if (!Array.isArray(conditions)) return [];

      return conditions.map(
        ({ type, status, error, transitioning, message }) => {
          let stateBackground = "bg-info";
          let icon = "icon-info";

          if (error) {
            stateBackground = "bg-error";
            icon = "icon-error";
          } else if (transitioning) {
            stateBackground = "bg-warning";
            icon = "icon-warning";
          } else if (status === "True") {
            stateBackground = "bg-success";
            icon = "icon-checkmark";
          }

          return {
            key: type,
            tooltip: message,
            value: { stateBackground, stateDisplay: type },
            icon,
          };
        }
      );
    },

    diskConditions(conditions) {
      return this.mapConditions(conditions);
    },

    /**
     * Refined Removal Logic:
     * A disk can only be removed if scheduling is disabled AND no data is scheduled.
     */
    canBeRemoved(disk) {
      const isScheduled = (disk.storageScheduled || 0) > 0;
      const schedulingAllowed = disk.allowScheduling === true;

      return !isScheduled && !schedulingAllowed;
    },
  },

    computed: {
    disks() {
      return this.value?.disks || [];
    },

    nodeConditions() {
      return this.mapConditions(this.value?.status?.conditions);
    },

    nodeSchedulingOptions() {
      return [
        { label: this.t("generic.enabled"), value: true },
        { label: this.t("generic.disabled"), value: false },
      ];
    },

    evictionRequestedOptions() {
      return [
        { label: this.t("generic.trueOption"), value: true },
        { label: this.t("generic.falseOption"), value: false },
      ];
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
      @error="onError"
    >
      <NameNsDescription
        :value="value"
        :mode="mode"
        :namespace-disabled="true"
        :name-hidden="mode !== _VIEW"
        :description-hidden="false"
        :force-namespace="LONGHORN_NAMESPACE"
      />

      <Tabbed sideTabs :resource="value">
        <Tab name="basics" labelKey="longhorn.node.tab.basics">
          <div class="row mb-10 conditions">
            <BadgeState
              v-for="condition in nodeConditions"
              :key="condition.key"
              class="mr-10 mb-10"
              :value="condition.value"
              :icon="condition.icon"
              v-clean-tooltip="condition.tooltip"
            />
          </div>

          <div class="row mb-20">
            <div class="col span-6">
              <LabeledInput
                v-model:value="value.status.region"
                class="mb-10"
                labelKey="longhorn.node.form.region"
                :mode="mode"
                disabled
              />
              <LabeledInput
                v-model:value="value.status.zone"
                class="mb-10"
                labelKey="longhorn.node.form.zone"
                :mode="mode"
                disabled
              />
              <UnitInput
                v-model:value="value.spec.instanceManagerCPURequest"
                class="mb-20"
                label-key="longhorn.node.form.instanceManagerCPURequest"
                :mode="mode"
                suffix="m"
                positive
              />
              <RadioGroup
                v-model:value="value.spec.allowScheduling"
                name="nodeScheduling"
                class="mb-20"
                :label="t('longhorn.node.form.scheduling')"
                :mode="mode"
                :options="nodeSchedulingOptions"
                :row="true"
              />
              <RadioGroup
                v-model:value="value.spec.evictionRequested"
                name="nodeEvictionRequested"
                class="mb-20"
                :label="t('longhorn.node.form.evictionRequested')"
                :mode="mode"
                :options="evictionRequestedOptions"
                :row="true"
              />
              <ArrayList
                v-model:value="value.spec.tags"
                :mode="mode"
                :title="t('longhorn.node.form.tags')"
                :add-label="t('longhorn.node.form.addTags')"
              >
                <template #title>
                  <h4>{{ t("longhorn.node.form.tags") }}</h4>
                </template>
              </ArrayList>
            </div>
          </div>
        </Tab>

        <Tab name="disk" labelKey="longhorn.node.tab.disks">
          <InfoBox
            v-for="disk in disks"
            :key="disk.id || disk.diskPath"
            class="mb-20"
          >
            <div class="box-head mb-20">
              <h3>{{ disk.diskName }}</h3>
              <button
                v-if="mode !== _VIEW"
                type="button"
                class="role-link btn btn-sm remove"
                :disabled="!canBeRemoved(disk)"
                v-clean-tooltip="
                  !canBeRemoved(disk)
                    ? t('longhorn.node.form.removeTooltip')
                    : null
                "
              >
                <i class="icon icon-x" />
              </button>
            </div>

            <div class="row mb-10 conditions">
              <BadgeState
                v-for="condition in diskConditions(disk.conditions)"
                :key="condition.key"
                class="mr-10 mb-10"
                :value="condition.value"
                :icon="condition.icon"
                v-clean-tooltip="condition.tooltip"
              />
            </div>

            <div class="row mb-10">
              <div class="col span-6">
                <LabeledInput
                  v-model:value="disk.diskType"
                  class="mb-10"
                  labelKey="longhorn.node.form.diskType"
                  :mode="mode"
                  disabled
                />
                <LabeledInput
                  v-model:value="disk.diskPath"
                  class="mb-10"
                  labelKey="longhorn.node.form.diskPath"
                  :mode="mode"
                  disabled
                />
                <UnitInput
                  v-model:value="disk.storageReserved"
                  class="mb-10"
                  :input-exponent="3"
                  :increment="1024"
                  label-key="longhorn.node.form.storageReserved"
                  :mode="mode"
                  positive
                />
              </div>
            </div>

            <div class="row mb-20">
              <div class="col span-4">
                <LabelValue
                  :name="t('longhorn.node.form.storageAvailable')"
                  :value="`${bytesToGi(disk.storageAvailable)} ${GiB_UNIT}`"
                />
              </div>
              <div class="col span-4">
                <LabelValue
                  :name="t('longhorn.node.form.storageScheduled')"
                  :value="`${bytesToGi(disk.storageScheduled)} ${GiB_UNIT}`"
                />
              </div>
              <div class="col span-4">
                <LabelValue
                  :name="t('longhorn.node.form.storageMaximum')"
                  :value="`${bytesToGi(disk.storageMaximum)} ${GiB_UNIT}`"
                />
              </div>
            </div>

            <div class="row">
              <div class="col span-6">
                <RadioGroup
                  v-model:value="disk.allowScheduling"
                  :name="`diskScheduling-${disk.id}`"
                  class="mb-20"
                  :label="t('longhorn.node.form.scheduling')"
                  :mode="mode"
                  :options="nodeSchedulingOptions"
                  :row="true"
                />
                <RadioGroup
                  v-model:value="disk.evictionRequested"
                  :name="`diskEviction-${disk.id}`"
                  class="mb-20"
                  :label="t('longhorn.node.form.evictionRequested')"
                  :mode="mode"
                  :options="evictionRequestedOptions"
                  :row="true"
                />
                <ArrayList
                  v-model:value="disk.tags"
                  :mode="mode"
                  :title="t('longhorn.node.form.tags')"
                  :add-label="t('longhorn.node.form.addTags')"
                >
                  <template #title>
                    <h4>{{ t("longhorn.node.form.tags") }}</h4>
                  </template>
                </ArrayList>
              </div>
            </div>
          </InfoBox>
        </Tab>
      </Tabbed>
    </CruResource>
  </div>
</template>

<style lang="scss" scoped>
.conditions {
  display: flex;
  flex-wrap: wrap;
}

.box-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;

  h3 {
    margin-bottom: 0;
  }
}
</style>
