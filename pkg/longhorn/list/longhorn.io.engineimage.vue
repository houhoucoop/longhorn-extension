<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import Loading from "@shell/components/Loading.vue"; // 確保路徑正確
import ResourceTable from "@shell/components/ResourceTable.vue"; // 確保路徑正確
import { allHash } from "@shell/utils/promise";
import {
  LONGHORN_RESOURCES,
  LONGHORN_RESOURCE_IDS,
} from "../constants/resources";

const props = defineProps({
  resource: {
    type: String,
    required: true,
  },
  schema: {
    type: Object,
    required: true,
  },
});

const store = useStore();

const isLoading = ref(true);
const loadError = ref<Error | null>(null);

const inStore = computed(() => store.getters["currentProduct"].inStore);

const allResources = computed(() => {
  if (!inStore.value) return [];
  return store.getters[`${inStore.value}/all`](props.resource) || [];
});

const rows = computed(() => allResources.value);

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
      engineImages: store.dispatch(`${inStore.value}/findAll`, { type: props.resource }),
      defaultEngineImage: store.dispatch(`${inStore.value}/find`, {
        type: LONGHORN_RESOURCES.SETTINGS,
        id: LONGHORN_RESOURCE_IDS.DEFAULT_ENGINE_IMAGE,
      }),
    };

    await allHash(hash);

  } catch (e: any) {
    console.error("Failed to fetch EngineImage data:", e);
    loadError.value = e;
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchData);
defineExpose({ loadError });
</script>

<template>
  <Loading v-if="isLoading" />
  <div v-else-if="loadError">
    Error loading data: {{ loadError.message }}
  </div>
  <div v-else>
    <ResourceTable :rows="rows" :schema="props.schema" />
  </div>
</template>