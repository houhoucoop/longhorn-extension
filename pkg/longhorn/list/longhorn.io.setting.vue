<script>
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

  props: {
    resource: {
      type: String,
      required: true,
    },
    schema: {
      type: Object,
      required: true,
    },
  },

  async fetch() {
    const clusterId = this.$route.params.cluster;
    const proxyUrl = proxyUrlFromParts(
      clusterId,
      LONGHORN_NAMESPACE,
      'longhorn-frontend',
      'http',
      '80',
      '/v1/settings'
    );

    try {
      // Load resources
      await this.$store.dispatch(`${this.inStore}/findAll`, { type: LONGHORN_RESOURCES.SETTINGS });
      const settingsApi = await this.$store.dispatch(`${this.inStore}/request`, { url: proxyUrl });

      console.log('Settings API response:', settingsApi);
      console.log('Rows from store:', this.rows);

      if (settingsApi?.data) {
        this.settingsApiData = settingsApi.data;
        this.processSettings();
      }
    } catch (e) {
      console.error('Fetch error:', e);
      this.loadError = e;
    }
  },

  data() {
    return {
      settings: {},
      groups: [],
      values: {},
      loadError: null,
      errors: [],
      settingsApiData: [],
      originalValues: {}, // Store original values for comparison
      resourceMap: {}, // Map setting ID to resource for save
    };
  },

  computed: {
    inStore() {
      return this.$store.getters['currentProduct'].inStore;
    },

    rows() {
      if (!this.inStore) {
        return [];
      }

      const getter = this.$store.getters[`${this.inStore}/all`];

      return typeof getter === 'function' ? getter(this.resource) || [] : [];
    },

    canEdit() {
      return !this.$fetchState.pending && !this.loadError;
    },
  },

  watch: {
    rows() {
      this.processSettings();
    },
  },

  methods: {
    processSettings() {
      console.log('processSettings called');
      console.log('settingsApiData:', this.settingsApiData);
      console.log('rows:', this.rows);

      if (!this.settingsApiData.length || !this.rows.length) {
        console.log('Early return: settingsApiData or rows is empty');

        return;
      }

      const categoryMap = {};
      const settings = {};
      const values = {};
      const groups = [];

      // Create a map of settings resources by id for quick lookup
      const settingsResourceMap = {};

      this.rows.forEach((resource) => {
        console.log('Resource ID:', resource.id, 'Name:', resource.metadata?.name);
        settingsResourceMap[resource.id] = resource;
        // Also map by name without namespace prefix
        if (resource.metadata?.name) {
          settingsResourceMap[resource.metadata.name] = resource;
        }
      });

      this.settingsApiData.forEach((setting) => {
        const { id, definition } = setting;

        console.log('Processing setting ID:', id);
        // Get value from settings resource - try both formats
        const resource = settingsResourceMap[id] || this.rows.find((r) => r.id === id || r.metadata?.name === id);

        console.log('Found resource for', id, ':', !!resource);

        // Store resource mapping for save operation
        if (resource) {
          this.resourceMap[id] = resource;
        }

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
      this.originalValues = { ...values }; // Store original values for comparison
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
      // Update resource values directly
      Object.keys(newValues).forEach((settingId) => {
        const newValue = newValues[settingId];
        const resource = this.resourceMap[settingId];

        if (resource) {
          const type = this.settings[settingId]?.type || 'string';

          resource.value = this.stringifyValue(newValue, type);
          console.log(`Updated ${settingId} (${type}):`, { newValue, stringified: resource.value });
        }
      });

      // Also update local values for reactivity
      this.values = newValues;
    },

    async save(btnCB) {
      this.errors = [];

      try {
        const updates = [];

        console.log('Save called');
        console.log('Current values:', this.values);
        console.log('Original values:', this.originalValues);
        console.log('Resource map keys:', Object.keys(this.resourceMap));

        // Save all changed resources
        Object.keys(this.values).forEach((settingId) => {
          const currentValue = this.values[settingId];
          const originalValue = this.originalValues[settingId];
          const resource = this.resourceMap[settingId];

          console.log(`Checking ${settingId}:`, {
            current: currentValue,
            original: originalValue,
            changed: JSON.stringify(currentValue) !== JSON.stringify(originalValue),
            hasResource: !!resource,
          });

          // Only save if value changed and resource exists
          if (resource && JSON.stringify(currentValue) !== JSON.stringify(originalValue)) {
            console.log(`Adding ${settingId} to updates`);
            updates.push(resource.save());
          }
        });

        console.log(`Total updates: ${updates.length}`);

        if (updates.length > 0) {
          await Promise.all(updates);
          // Update original values after successful save
          this.originalValues = { ...this.values };
        }

        btnCB(true);
      } catch (err) {
        console.error('Save error:', err);
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
  <Loading v-if="$fetchState.pending" />
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
