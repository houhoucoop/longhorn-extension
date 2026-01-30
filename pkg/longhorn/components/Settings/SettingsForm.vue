<script>
import { LabeledInput } from '@components/Form/LabeledInput';
import { Checkbox } from '@components/Form/Checkbox';
import LabeledSelect from '@shell/components/form/LabeledSelect.vue';

export default {
  name: 'SettingsForm',

  components: {
    LabeledInput,
    Checkbox,
    LabeledSelect,
  },

  props: {
    settings: {
      type: Object,
      required: true,
    },
    groups: {
      type: Array,
      default: () => [],
    },
    values: {
      type: Object,
      required: true,
    },
    mode: {
      type: String,
      default: 'edit',
    },
  },

  emits: ['update:value'],

  data() {
    return {
      expandedGroups: {},
    };
  },

  mounted() {
    // Initialize expanded state for all groups
    this.groups.forEach((group, index) => {
      this.expandedGroups[group.name] = index === 0; // First group expanded by default
    });
  },

  methods: {
    isExpanded(groupName) {
      return this.expandedGroups[groupName] !== false;
    },

    toggleGroup(groupName) {
      this.expandedGroups[groupName] = !this.expandedGroups[groupName];
    },

    getValue(settingId) {
      return this.values[settingId];
    },

    updateValue(settingId, value) {
      const newValues = { ...this.values, [settingId]: value };

      this.$emit('update:value', newValues);
    },

    updateJsonField(settingId, key, value) {
      const currentValue = this.getValue(settingId) || {};
      const newJsonValue = { ...currentValue, [key]: value };

      this.updateValue(settingId, newJsonValue);
    },

    formatDescription(text) {
      if (!text) return '';

      // Convert **text** to <strong>text</strong>
      return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    },
  },
};
</script>

<template>
  <div class="settings-container">
    <div v-for="group in groups" :key="group.name" class="setting-row box">
      <div class="header">
        <div
          class="title clickable"
          tabindex="0"
          role="button"
          @click="toggleGroup(group.name)"
          @keydown.space.enter.stop.prevent="toggleGroup(group.name)"
        >
          <i
            :class="{
              ['icon icon-chevron-right']: !isExpanded(group.name),
              ['icon icon-chevron-down']: isExpanded(group.name),
            }"
          />
          <h2 class="label">
            {{ group.label }}
          </h2>
        </div>
      </div>

      <div v-if="isExpanded(group.name)" class="body">
        <div class="group mt-10">
          <div v-for="settingId in group.children" :key="settingId" class="setting-row">
            <template v-if="settings[settingId].type === 'bool'">
              <div class="checkbox-row">
                <h3
                  v-if="settings[settingId].label"
                  class="label clickable-label"
                  @click="!settings[settingId].readOnly && updateValue(settingId, !getValue(settingId))"
                >
                  <span v-if="settings[settingId].required" class="text-error">* </span>{{ settings[settingId].label }}:
                </h3>
                <Checkbox
                  :value="getValue(settingId)"
                  :mode="mode"
                  :disabled="settings[settingId].readOnly"
                  :required="settings[settingId].required"
                  @update:value="updateValue(settingId, $event)"
                />
              </div>
              <div v-if="settings[settingId].description" class="description mt-10">
                <!-- eslint-disable-next-line vue/no-v-html -->
                <label class="text-label" v-html="formatDescription(settings[settingId].description)"></label>
              </div>
            </template>

            <template v-else>
              <template v-if="settings[settingId].type === 'int'">
                <div class="input-row">
                  <h3 v-if="settings[settingId].label" class="label">
                    <span v-if="settings[settingId].required" class="text-error">* </span
                    >{{ settings[settingId].label }}:
                  </h3>
                  <LabeledInput
                    :value="getValue(settingId)"
                    :mode="mode"
                    type="number"
                    :disabled="settings[settingId].readOnly"
                    :required="settings[settingId].required"
                    @update:value="updateValue(settingId, $event)"
                  />
                </div>
                <div v-if="settings[settingId].description" class="description mt-10">
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <label class="text-label" v-html="formatDescription(settings[settingId].description)"></label>
                </div>
              </template>

              <template v-else>
                <template v-if="settings[settingId].isJsonObject">
                  <div class="header">
                    <div class="title">
                      <h3 v-if="settings[settingId].label" class="label">
                        <span v-if="settings[settingId].required" class="text-error">* </span
                        >{{ settings[settingId].label }}
                      </h3>
                    </div>
                  </div>
                  <div class="body mt-10">
                    <div v-for="key in settings[settingId].jsonKeys" :key="key" class="json-field-row mb-10">
                      <h4 class="json-field-label">{{ key.toUpperCase() }} Data Engine:</h4>
                      <template v-if="settings[settingId].options">
                        <LabeledSelect
                          :value="(getValue(settingId) || {})[key]"
                          :mode="mode"
                          :options="settings[settingId].options"
                          :disabled="settings[settingId].readOnly"
                          @update:value="updateJsonField(settingId, key, $event)"
                        />
                      </template>
                      <template v-else>
                        <LabeledInput
                          :value="(getValue(settingId) || {})[key]"
                          :mode="mode"
                          :disabled="settings[settingId].readOnly"
                          @update:value="updateJsonField(settingId, key, $event)"
                        />
                      </template>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="select-row">
                    <h3 v-if="settings[settingId].label" class="label">
                      <span v-if="settings[settingId].required" class="text-error">* </span
                      >{{ settings[settingId].label }}:
                    </h3>
                    <template v-if="settings[settingId].options">
                      <LabeledSelect
                        :value="getValue(settingId)"
                        :mode="mode"
                        :options="settings[settingId].options"
                        :disabled="settings[settingId].readOnly"
                        :required="settings[settingId].required"
                        @update:value="updateValue(settingId, $event)"
                      />
                    </template>
                    <template v-else>
                      <LabeledInput
                        :value="getValue(settingId)"
                        :mode="mode"
                        :disabled="settings[settingId].readOnly"
                        :required="settings[settingId].required"
                        @update:value="updateValue(settingId, $event)"
                      />
                    </template>
                  </div>
                </template>
                <div v-if="settings[settingId].description" class="description mt-10">
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <label class="text-label" v-html="formatDescription(settings[settingId].description)"></label>
                </div>
              </template>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.settings-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.setting-row.box {
  border: 1px solid var(--border);
  padding: 15px;
  border-radius: var(--border-radius);
}

.title {
  display: flex;
  align-items: center;
  gap: 8px;

  &.clickable {
    cursor: pointer;
    user-select: none;
  }

  h2 {
    margin-bottom: 0;
  }
}

.group {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 12px;

  h3 {
    margin: 0;
    line-height: 1;
  }

  .clickable-label {
    cursor: pointer;
    user-select: none;
  }
}

.input-row {
  display: flex;
  align-items: center;
  gap: 12px;

  h3 {
    margin: 0;
    line-height: 1;
    white-space: nowrap;
  }

  .labeled-input {
    max-width: 150px;
  }
}

.select-row {
  display: flex;
  align-items: center;
  gap: 12px;

  h3 {
    margin: 0;
    line-height: 1;
    white-space: nowrap;
  }

  ::v-deep .labeled-select {
    max-width: 280px;
  }
}

.description {
  .text-label {
    white-space: pre-line;
  }
}

.json-field-row {
  display: flex;
  align-items: center;
  gap: 12px;

  .json-field-label {
    margin: 0;
    white-space: nowrap;
    font-size: 14px;
    font-weight: normal;
  }

  ::v-deep .labeled-select {
    max-width: 280px;
  }
}

.col {
  max-width: 100% !important;
}
</style>
