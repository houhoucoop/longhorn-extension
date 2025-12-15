<script lang="ts">
  // @ts-ignore
import Loading from "@shell/components/Loading";
// @ts-ignore
import CruResource from "@shell/components/CruResource";
// @ts-ignore
import NameNsDescription from "@shell/components/form/NameNsDescription";
// @ts-ignore
import { LabeledInput } from "@components/Form/LabeledInput";
// @ts-ignore
import Tabbed from "@shell/components/Tabbed";
// @ts-ignore
import Tab from "@shell/components/Tabbed/Tab";
import CreateEditView from "@shell/mixins/create-edit-view";
// @ts-ignore
import FormValidation from "@shell/mixins/form-validation";
import { _CREATE, _VIEW } from "@shell/config/query-params";
import { exceptionToErrorsArray } from "@shell/utils/error";
import { LONGHORN_NAMESPACE } from "../constants/longhorn";

export default {
  name: "EditEngineImage",

  components: {
    Loading,
    CruResource,
    NameNsDescription,
    LabeledInput,
    Tabbed,
    Tab,
  },

  mixins: [CreateEditView, FormValidation],

  props: {
    mode: {
      type: String,
      default: _CREATE,
    },
    value: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      fvFormRuleSets: [
        {
          path: "spec.image",
          rules: ["required"],
          translationKey: "longhorn.engineImage.form.image",
        },
      ],
      LONGHORN_NAMESPACE,
      _VIEW,
    };
  },

  created() {
    if (!this.value.spec) {
      this.value.spec = {};
    }
    if (this.value.spec.image === undefined) {
      this.value.spec.image = "";
    }
  },

  methods: {
    onError(errors: any) {
      this.errors = Array.isArray(errors) ? errors : [errors];
    },

    async save(buttonDone: (arg0: boolean) => void) {
      this.errors = [];

      if (!this.value.spec.image) {
        this.errors.push(
          this.t("longhorn.engineImage.form.validation.imageRequired")
        );
        buttonDone(false);
        return;
      }

      try {
        await this.actuallySave();
        buttonDone(true);
        this.done();
      } catch (err) {
        this.errors = exceptionToErrorsArray(err);
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
      @error="onError"
    >
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
          <LabeledInput
            labelKey="longhorn.engineImage.fields.image"
            :mode="mode"
            v-model:value="value.spec.image"
            :rules="fvGetAndReportPathRules('spec.image')"
          />
        </Tab>
      </Tabbed>
    </CruResource>
  </div>
</template>
