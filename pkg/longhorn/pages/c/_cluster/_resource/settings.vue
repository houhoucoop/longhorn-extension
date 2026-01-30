<script>
import { allHash } from '@shell/utils/promise';
import { proxyUrlFromParts } from '@shell/models/service';
import { LONGHORN_RESOURCES } from '@longhorn/types/resources';
import { LONGHORN_NAMESPACE } from '@longhorn/types/longhorn';
import Loading from '@shell/components/Loading.vue';
import AsyncButton from '@shell/components/AsyncButton.vue';
import { Banner } from '@components/Banner';
import SettingsForm from '@longhorn/components/Settings/SettingsForm.vue';

export default {
  name: 'LonghornSettings',

  components: {
    Loading,
    AsyncButton,
    Banner,
    SettingsForm,
  },

  data() {
    return {
      settings: {},
      groups: [],
      values: {},
      isLoading: true,
      loadError: null,
      errors: [],
      originalData: [],
    };
  },

  computed: {
    inStore() {
      return this.$store.getters['currentProduct'].inStore;
    },

    canEdit() {
      return !this.isLoading && !this.loadError;
    },
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    async fetchData() {
      this.isLoading = true;
      this.loadError = null;

      if (!this.inStore) {
        this.loadError = new Error('Vuex store namespace not found.');
        this.isLoading = false;

        return;
      }

      try {
        const clusterId = this.$route.params.cluster;
        const proxyUrl = proxyUrlFromParts(
          clusterId,
          LONGHORN_NAMESPACE,
          'longhorn-frontend',
          'http',
          '80',
          '/v1/settings'
        );

        const hash = {
          settings: this.$store.dispatch(`${this.inStore}/findAll`, { type: LONGHORN_RESOURCES.SETTINGS }),
          settingsApi: this.$store.dispatch(`${this.inStore}/request`, { url: proxyUrl }),
        };

        const res = await allHash(hash);

        // Process API response
        if (res.settingsApi?.data && res.settings) {
          this.originalData = res.settings;
          this.processSettings(res.settingsApi.data, res.settings);
        }
      } catch (e) {
        this.loadError = e;
      } finally {
        this.isLoading = false;
      }
    },

    processSettings(settingsArray, settingsResources) {
      const categoryMap = {};
      const settings = {};
      const values = {};
      const groups = [];

      // Create a map of settings resources by id for quick lookup
      const settingsResourceMap = {};

      settingsResources.forEach((resource) => {
        settingsResourceMap[resource.id] = resource;
      });

      settingsArray.forEach((setting) => {
        const { id, definition } = setting;
        // Get value from settings resource
        const resource = settingsResourceMap[id];
        const value = resource?.value || setting.value;
        const { category, type, displayName, description, readOnly, required, options } = definition;

        // Group by category
        if (!categoryMap[category]) {
          categoryMap[category] = [];
        }
        categoryMap[category].push(id);

        // Build settings object
        settings[id] = {
          type,
          label: displayName || id,
          description: description || '',
          readOnly: readOnly || false,
          required: required || false,
        };

        // Add options if available (for select/enum types)
        if (options && Array.isArray(options)) {
          settings[id].options = options;
        }

        // Check if value is a JSON object (e.g., {"v1":"","v2":""})
        let parsedValue = value;

        if (type === 'string' && value && typeof value === 'string' && value.startsWith('{')) {
          try {
            const jsonValue = JSON.parse(value);

            if (typeof jsonValue === 'object' && jsonValue !== null && !Array.isArray(jsonValue)) {
              settings[id].isJsonObject = true;
              settings[id].jsonKeys = Object.keys(jsonValue);
              parsedValue = jsonValue;
            }
          } catch (e) {
            // Not valid JSON, treat as regular string
          }
        }

        // Set initial values
        values[id] = this.parseValue(parsedValue, type);
      });

      // Build groups with custom order
      const categoryOrder = ['general', 'snapshot', 'system info', 'orphan', 'backup', 'scheduling', 'danger zone'];

      const sortedCategories = Object.keys(categoryMap).sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const aIndex = categoryOrder.indexOf(aLower);
        const bIndex = categoryOrder.indexOf(bLower);

        // If both are in the order list, sort by their position
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        // If only a is in the list, it comes first
        if (aIndex !== -1) {
          return -1;
        }
        // If only b is in the list, it comes first
        if (bIndex !== -1) {
          return 1;
        }

        // If neither is in the list, sort alphabetically
        return a.localeCompare(b);
      });

      sortedCategories.forEach((category) => {
        groups.push({
          name: category,
          label: category.charAt(0).toUpperCase() + category.slice(1),
          children: categoryMap[category],
        });
      });

      this.settings = settings;
      this.groups = groups;
      this.values = values;
    },

    parseValue(value, type) {
      if (type === 'bool') {
        return value === 'true' || value === true;
      }
      if (type === 'int') {
        return parseInt(value, 10) || 0;
      }
      // If value is already parsed JSON object, return it
      if (typeof value === 'object' && value !== null) {
        return value;
      }

      return value || '';
    },

    handleUpdate(newValues) {
      this.values = newValues;
    },

    async save(btnCB) {
      this.errors = [];

      try {
        const updates = [];

        // Build update requests for changed settings
        Object.keys(this.values).forEach((settingId) => {
          const newValue = this.values[settingId];
          const originalSetting = this.originalData.find((s) => s.id === settingId);
          const originalValue = this.parseValue(originalSetting?.value, originalSetting?.definition?.type);

          // Only update if value changed
          if (newValue !== originalValue) {
            const resource = this.originalData.find((s) => s.id === settingId);

            if (resource) {
              // Get the definition to determine the type
              const type = resource.spec?.definition?.type || 'string';

              // Clone the resource to avoid mutating the original
              const updatedResource = { ...resource };

              updatedResource.value = this.stringifyValue(newValue, type);

              // Save the updated resource (CRD)
              updates.push(resource.save());
            }
          }
        });

        if (updates.length > 0) {
          await Promise.all(updates);
          await this.fetchData();
        }

        btnCB(true);
      } catch (err) {
        this.errors.push(err.message || 'Failed to save settings');
        btnCB(false);
      }
    },

    stringifyValue(value, type) {
      if (type === 'bool') {
        return String(value);
      }
      if (type === 'int') {
        return String(value);
      } // If value is an object (JSON object fields), stringify it
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }

      return value;
    },
  },
};
</script>

<template>
  <Loading v-if="isLoading" />
  <div v-else class="longhorn-settings">
    <div class="header">
      <h1>{{ t('longhorn.settings.title') }}</h1>
    </div>

    <Banner v-if="loadError" color="error">
      {{ t('longhorn.settings.fetchError', { error: loadError.message }) }}
    </Banner>

    <Banner v-for="(err, idx) in errors" :key="idx" color="error">
      {{ err }}
    </Banner>

    <SettingsForm
      v-if="!loadError && Object.keys(settings).length > 0"
      class="mt-10"
      :settings="settings"
      :groups="groups"
      :values="values"
      mode="edit"
      @update:value="handleUpdate"
    />

    <div v-if="canEdit">
      <AsyncButton class="pull-right mt-30" :action-label="t('longhorn.settings.apply')" @click="save" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.longhorn-settings {
  .header {
    margin-bottom: 20px;

    h1 {
      margin-bottom: 10px;
    }
  }
}
</style>
