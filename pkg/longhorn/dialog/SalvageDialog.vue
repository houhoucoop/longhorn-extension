<script setup>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { Card } from '@components/Card';
import AsyncButton from '@shell/components/AsyncButton';
import { Banner } from '@components/Banner';
import Loading from '@shell/components/Loading';
import { useI18n } from '@shell/composables/useI18n';
import { exceptionToErrorsArray } from '@shell/utils/error';
import { LONGHORN_RESOURCES } from '@longhorn/types/resources';

const props = defineProps({
  resources: {
    type: Array,
    default: () => [],
  },
  replicas: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['close']);

const store = useStore();
const { t } = useI18n(store);

const loading = ref(false);
const errors = ref([]);
const selectedReplicaMap = ref({});
const nodes = ref([]);

const volume = computed(() => props.resources?.[0]);

const nodeNameMap = computed(() => {
  return nodes.value.reduce((map, node) => {
    const nodeId = node?.id;
    const nodeName = node?.metadata?.name || node?.name || nodeId;

    if (nodeId) {
      map[nodeId] = nodeName;
    }

    if (node?.metadata?.name) {
      map[node.metadata.name] = nodeName;
    }

    return map;
  }, {});
});

const replicaRows = computed(() => {
  return (props.replicas || []).map((replica) => {
    const hostId = replica?.hostID || replica?.hostId || '';
    const hostName = nodeNameMap.value[hostId] || hostId || 'N/A';

    return {
      name: replica?.name,
      failedAt: replica?.failedAt || '',
      hostName,
    };
  });
});

const selectedReplicaNames = computed(() => {
  const replicaMap = selectedReplicaMap.value;

  return Object.keys(replicaMap).filter((replicaName) => replicaMap[replicaName]);
});

const hasSelectableReplicas = computed(() => replicaRows.value.length > 0);

function close() {
  emit('close');
}

function toggleReplica(replicaName) {
  selectedReplicaMap.value = {
    ...selectedReplicaMap.value,
    [replicaName]: !selectedReplicaMap.value[replicaName],
  };
}

onMounted(async () => {
  const inStore = store.getters['currentProduct']?.inStore;

  if (!inStore) {
    return;
  }

  loading.value = true;

  try {
    nodes.value = await store.dispatch(`${inStore}/findAll`, { type: LONGHORN_RESOURCES.NODES });
  } catch {
    nodes.value = [];
  } finally {
    loading.value = false;
  }
});

async function submit(buttonDone) {
  errors.value = [];

  if (!volume.value) {
    errors.value = [t('longhorn.volume.dialog.confirm.errors.noReplicaForSalvage')];
    buttonDone(false);

    return;
  }

  if (!selectedReplicaNames.value.length) {
    errors.value = [t('longhorn.volume.dialog.salvage.errors.replicaRequired')];
    buttonDone(false);

    return;
  }

  try {
    await volume.value.doAction('salvage', { names: selectedReplicaNames.value });
    buttonDone(true);
    close();
  } catch (err) {
    errors.value = exceptionToErrorsArray(err);
    buttonDone(false);
  }
}
</script>

<template>
  <Card :show-highlight-border="false">
    <template #title>
      <h4>{{ t('longhorn.volume.dialog.salvage.title') }}</h4>
    </template>

    <template #body>
      <Loading v-if="loading" mode="relative" :no-delay="true" />
      <div v-else>
        <p class="mb-10">{{ t('longhorn.volume.dialog.salvage.description') }}</p>

        <Banner
          v-if="!hasSelectableReplicas"
          color="warning"
          :label="t('longhorn.volume.dialog.confirm.errors.noReplicaForSalvage')"
          class="mb-10"
        />

        <div v-else class="replica-list">
          <label v-for="replica in replicaRows" :key="replica.name" class="replica-item">
            <input
              type="checkbox"
              :checked="!!selectedReplicaMap[replica.name]"
              @change="toggleReplica(replica.name)"
            />
            <div class="replica-meta">
              <div class="replica-name">{{ replica.name }}</div>
              <div class="replica-sub">{{ t('longhorn.volume.dialog.salvage.form.host') }}: {{ replica.hostName }}</div>
              <div class="replica-sub">
                {{ t('longhorn.volume.dialog.salvage.form.failedAt') }}:
                {{ replica.failedAt || t('generic.na') }}
              </div>
            </div>
          </label>
        </div>

        <p class="mt-10">
          {{ t('longhorn.volume.dialog.salvage.form.selectedCount', { count: selectedReplicaNames.length }) }}
        </p>

        <Banner v-for="(err, i) in errors" :key="i" color="error" :label="err" class="mt-10" />
      </div>
    </template>

    <template #actions>
      <div class="actions-row">
        <button class="btn role-secondary mr-10" @click="close">
          {{ t('generic.cancel') }}
        </button>
        <AsyncButton
          :disabled="!hasSelectableReplicas"
          :action-label="t('longhorn.volume.dialog.salvage.actions.salvage')"
          @click="submit"
        />
      </div>
    </template>
  </Card>
</template>

<style lang="scss" scoped>
.replica-list {
  max-height: 320px;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: 4px;
}

.replica-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
}

.replica-item:last-child {
  border-bottom: 0;
}

.replica-name {
  font-weight: 600;
}

.replica-sub {
  font-size: 12px;
  color: var(--muted);
}

.actions-row {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
</style>
