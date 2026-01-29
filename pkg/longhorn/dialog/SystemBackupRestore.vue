<script>
import { Card } from "@components/Card";
import { LabeledInput } from "@components/Form/LabeledInput";
import AsyncButton from "@shell/components/AsyncButton";
import FormValidation from "@shell/mixins/form-validation";

export default {
  name: "SystemBackupRestore",

  emits: ["close"],

  components: {
    Card,
    LabeledInput,
    AsyncButton,
  },

  mixins: [FormValidation],

  props: {
    resources: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      value: {
        name: "",
        version: "",
        systemBackup: "",
      },
      fvFormRuleSets: [{ path: "name", rules: ["required"] }],
    };
  },

  computed: {
    resource() {
      return this.resources?.[0] || {};
    },
  },

  mounted() {
    // Initialize values from resource
    this.value.version = this.resource?.status?.version || "";
    this.value.systemBackup = this.resource?.metadata?.name || "";
  },

  methods: {
    close() {
      this.$emit("close");
    },

    restore() {
      const restoreData = {
        name: this.value.name,
        version: this.value.version,
        systemBackup: this.value.systemBackup,
      };

      // TODO: Call API to restore system backup
      // await this.resource.doAction('restore', restoreData);

      this.close();
    },
  },
};
</script>

<template>
  <Card :showHighlightBorder="false">
    <template #title>
      <h4>Restore System Backup</h4>
    </template>

    <template #body>
      <LabeledInput
        class="mt-10 mb-10"
        v-model:value="value.name"
        label="Name"
        :rules="fvGetAndReportPathRules('name')"
        required
      />
      <LabeledInput
        class="mb-15"
        v-model:value="value.version"
        label="Version"
        disabled
      />
      <LabeledInput
        v-model:value="value.systemBackup"
        label="System Backup"
        disabled
      />
    </template>

    <template #actions>
      <div class="actions-row">
        <button class="btn role-secondary mr-10" @click="close">Cancel</button>
        <AsyncButton
          type="submit"
          class="btn bg-primary"
          :disabled="!fvFormIsValid"
          @click="restore"
        />
      </div>
    </template>
  </Card>
</template>

<style scoped>
.actions-row {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
</style>
