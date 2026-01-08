<script>
import { RadioGroup } from "@components/Form/Radio";
import UnitInput from "@shell/components/form/UnitInput.vue";
import { LabeledInput } from "@components/Form/LabeledInput";
import ArrayList from "@shell/components/form/ArrayList";
import InfoBox from "@shell/components/InfoBox";
import LabelValue from "@shell/components/LabelValue";
import { BadgeState } from "@components/BadgeState";
import { _VIEW } from "@shell/config/query-params";

export default {
  components: {
    BadgeState,
    LabeledInput,
    UnitInput,
    RadioGroup,
    ArrayList,
    InfoBox,
    LabelValue,
  },
  props: {
    mode: { type: String, required: true },
    disks: { type: Array, required: true },
    bytesToGi: { type: Function, required: true },
    GiB_UNIT: { type: String, required: true },
    mapConditions: { type: Function, required: true },
  },
  data() {
    return { _VIEW };
  },
  computed: {
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
  methods: {
    canBeRemoved(disk) {
      const isScheduled = (disk.storageScheduled || 0) > 0;
      const schedulingAllowed = disk.allowScheduling === true;
      return !isScheduled && !schedulingAllowed;
    },
  },
};
</script>

<template>
  <div>
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
            !canBeRemoved(disk) ? t('longhorn.node.form.removeTooltip') : null
          "
        >
          <i class="icon icon-x" />
        </button>
      </div>

      <div class="row mb-10 conditions">
        <BadgeState
          v-for="condition in mapConditions(disk.conditions)"
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
            :label="t('longhorn.node.form.diskType')"
            :mode="mode"
            disabled
          />
          <LabeledInput
            v-model:value="disk.diskPath"
            class="mb-10"
            :label="t('longhorn.node.form.diskPath')"
            :mode="mode"
            disabled
          />
          <UnitInput
            v-model:value="disk.storageReserved"
            class="mb-10"
            :input-exponent="3"
            :increment="1024"
            :label="t('longhorn.node.form.storageReserved')"
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
          />
        </div>
      </div>
    </InfoBox>
  </div>
</template>
