<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { useRouter, useRoute } from 'vue-router';
import { MESSAGE, NAME, OBJECT, REASON, EVENT_TYPE } from '@shell/config/table-headers';
import { EVENT } from '@shell/config/types';
import PaginatedResourceTable from '@shell/components/PaginatedResourceTable';
import { STEVE_NAME_COL } from '@shell/config/pagination-table-headers';
import { headerFromSchemaColString } from '@shell/store/type-map.utils';

const reason = {
  ...REASON,
  ...{ canBeVariable: true },
};

const eventHeaders = [
  reason,
  OBJECT,
  MESSAGE,
  NAME,
  {
    name: 'date',
    label: 'Date',
    labelKey: 'clusterIndexPage.sections.events.date.label',
    value: 'timestamp',
    sort: 'timestamp:desc',
    formatter: 'Date',
    width: 220,
    defaultSort: true,
  },
];

const store = useStore();
const router = useRouter();
const route = useRoute();

const schema = ref(null);
const paginationHeaders = ref(null);
const dismissRouteHandler = ref(() => {
  // Handler for dismiss route
});

onMounted(() => {
  const schemaObj = store.getters['cluster/schemaFor'](EVENT);

  const paginationHeadersObj = schemaObj
    ? [
        {
          ...headerFromSchemaColString('Last Seen', schemaObj, store.getters, true),
          defaultSort: true,
        },
        headerFromSchemaColString('First Seen', schemaObj, store.getters, true),
        headerFromSchemaColString('Count', schemaObj, store.getters, true),
        {
          ...STEVE_NAME_COL,
          defaultSort: false,
        },
        OBJECT,
        EVENT_TYPE,
        reason,
        headerFromSchemaColString('Source', schemaObj, store.getters, true),
        MESSAGE,
      ]
    : [];

  schema.value = schemaObj;
  paginationHeaders.value = paginationHeadersObj;

  dismissRouteHandler.value = router.beforeEach((to, from, next) => onRouteChange(to, from, next));
});

onBeforeUnmount(() => {
  if (dismissRouteHandler.value) dismissRouteHandler.value();
});

async function onRouteChange(to, from, next) {
  if (route.name !== to.name) {
    await store.dispatch('cluster/forgetType', EVENT);
  }
  next();
}

function onApiFilter(pagination) {
  if (!pagination.projectsOrNamespaces || !pagination.projectsOrNamespaces[0]) {
    pagination.projectsOrNamespaces = [{ fields: [] }];
  }

  pagination.projectsOrNamespaces[0].fields = [
    {
      equals: true,
      exact: true,
      exists: false,
      field: undefined,
      value: 'longhorn-system',
    },
  ];

  return pagination;
}
</script>

<template>
  <h3 class="title">
    {{ t('longhorn.dashboard.events') }}
  </h3>
  <PaginatedResourceTable
    v-if="!!schema"
    :schema="schema"
    :headers="eventHeaders"
    :pagination-headers="paginationHeaders"
    :api-filter="onApiFilter"
    key-field="id"
    :search="false"
    :table-actions="false"
    :row-actions="false"
    :groupable="false"
    :rows-per-page="10"
  />
</template>

<style lang="scss" scoped>
.title {
  margin: 24px 0;
}
.events-link {
  align-self: center;
  padding-right: 20px;
  white-space: nowrap;
}
</style>
