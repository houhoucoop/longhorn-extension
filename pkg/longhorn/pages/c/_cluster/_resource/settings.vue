<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { allHash } from '@shell/utils/promise';
import ConfigMapSettings from '@shell/components/ConfigMapSettings';
import { LONGHORN_RESOURCES } from '@longhorn/types/resources';
import Loading from '@shell/components/Loading.vue';
import { Banner } from '@components/Banner';

const store = useStore();

const configValues = reactive({
  api: {
    ttl: 3600
  },
  cluster: {
    nodeTaints: [],
  },
  system: {
    registry: 'docker.io'
  }
});

const settingsMetaData = ref({
  'api-ttl': {
    type: 'number',
    path: 'api.ttl',
    handler: 'UnitInput',
    tooltip: true,
  },
  'node-taints': {
    type: 'object',
    path: 'cluster.nodeTaints',
    handler: 'Taints',
  },
  'system-default-registry': {
    type: 'string',
    path: 'system.registry',
    class: 'span-8'
  }
});

const settingsGroups = ref([
  {
    name: 'general',
    expanded: true,
    children: ['api-ttl'],
    weight: 0
  },
  {
    name: 'dangerZone',
    children: ['node-taints', 'system-default-registry'],
    weight: 1
  }
]);

const isLoading = ref(true);
const loadError = ref(null);

const inStore = computed(() => {
  return store.getters["currentProduct"].inStore;
});

async function fetchData() {
  isLoading.value = true;
  loadError.value = null;

  if (!inStore.value) {
      loadError.value = new Error("Vuex store namespace not found.");
      isLoading.value = false;
      return;
  }

  try {
    const hash = {
      settings: store.dispatch(`${inStore.value}/findAll`, {
          type: LONGHORN_RESOURCES.SETTINGS
      }),
    };

    const res = await allHash(hash);

    console.log('Fetched settings data:', res.settings);

  } catch (e) {
    console.error(`Failed to fetch Longhorn settings:`, e);
    loadError.value = e;
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  fetchData();
});

function handleUpdate(newValues) {
  Object.assign(configValues, newValues);
  console.log('Configuration updated:', newValues);
}
</script>

<template>
  <div class="outlet">
    <Banner v-if="loadError" color="error">
        {{ t('longhorn.settings.fetchError', { error: loadError.message }) }}
    </Banner>

    <Loading v-else-if="isLoading" />

    <div v-else class="config-form-container">
      <ConfigMapSettings
        :settings="settingsMetaData"
        :groups="settingsGroups"
        :values="configValues"
        :label-key-prefix="'longhorn.settings'"
        :mode="'edit'"
        @update:value="handleUpdate"
      />
    </div>
  </div>
</template>

<style scoped>

</style>