<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import Loading from "@shell/components/Loading";
import ResourceTable from "@shell/components/ResourceTable";
import { allHash } from "@shell/utils/promise";
import Banner from "@components/Banner/Banner.vue";
import { LONGHORN_RESOURCES } from "@longhorn/types/resources";

const props = defineProps({
  resource: {
    type: String,
    required: true,
    default: LONGHORN_RESOURCES.RECURRING_JOBS,
  },
  schema: {
    type: Object,
    required: true,
  },
});

const store = useStore();

const isLoading = ref(true);
const loadError = ref(null);

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
      recurringJobs: store.dispatch(`${inStore.value}/findAll`, {
        type: props.resource,
      }),
    };

    await allHash(hash);
  } catch (e) {
    console.error(`Failed to fetch ${props.resource} data:`, e);
    loadError.value = e;
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchData);
defineExpose({ loadError, fetchData });
</script>

<template>
  <Loading v-if="isLoading" />
  <div v-else>
    <Banner v-if="loadError" color="error">
      {{
        t("error.fetchError", {
          message: loadError.message || String(loadError),
        })
      }}
    </Banner>
    <ResourceTable :rows="rows" :schema="props.schema" />
  </div>
</template>
