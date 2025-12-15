<script lang="ts">
import { defineComponent } from "vue";
import {
  MESSAGE,
  NAME,
  OBJECT,
  REASON,
  EVENT_TYPE,
} from "@shell/config/table-headers";
import { EVENT } from "@shell/config/types";
// @ts-ignore
import PaginatedResourceTable from "@shell/components/PaginatedResourceTable";
// @ts-ignore
import { STEVE_NAME_COL } from "@shell/config/pagination-table-headers";
import { headerFromSchemaColString } from "@shell/store/type-map.utils";
// @ts-ignore
import { NAME as EXPLORER } from "@shell/config/product/explorer";

interface PaginationField {
  equals?: boolean;
  exact?: boolean;
  exists?: boolean;
  field?: string | undefined;
  value?: string;
}

interface Pagination {
  projectsOrNamespaces?: { fields: PaginationField[] }[];
}

const reason = {
  ...REASON,
  ...{ canBeVariable: true },
  width: 130,
};

const eventHeaders = [
  reason,
  OBJECT,
  MESSAGE,
  NAME,
  {
    name: "date",
    label: "Date",
    labelKey: "clusterIndexPage.sections.events.date.label",
    value: "timestamp",
    sort: "timestamp:desc",
    formatter: "Date",
    width: 220,
    defaultSort: true,
  },
];

export default defineComponent({
  name: "LonghornEvents",

  components: { PaginatedResourceTable },

  data() {
    return {
      schema: null as any,
      events: [] as any[],
      eventHeaders,
      paginationHeaders: null as any,
      dismissRouteHandler: (() => {}) as () => void,
      allEventsLink: {
        name: "c-cluster-product-resource",
        params: {
          product: EXPLORER,
          resource: EVENT,
        },
      },
    };
  },

  beforeMount() {
    const schema = this.$store.getters["cluster/schemaFor"](EVENT);

    const paginationHeaders = schema
      ? [
          {
            ...headerFromSchemaColString(
              "Last Seen",
              schema,
              this.$store.getters,
              true,
            ),
            defaultSort: true,
          },
          headerFromSchemaColString(
            "First Seen",
            schema,
            this.$store.getters,
            true
          ),
          headerFromSchemaColString("Count", schema, this.$store.getters, true),
          {
            ...STEVE_NAME_COL,
            defaultSort: false,
          },
          OBJECT,
          EVENT_TYPE,
          reason,
          headerFromSchemaColString("Source", schema, this.$store.getters, true),
          MESSAGE,
        ]
      : [];

    this.schema = schema;
    this.paginationHeaders = paginationHeaders;
  },

  mounted() {
    this.dismissRouteHandler = this.$router.beforeEach((to, from, next) =>
      this.onRouteChange(to, from, next)
    );
  },

  beforeUnmount() {
    if (this.dismissRouteHandler) this.dismissRouteHandler();
  },

  methods: {
    async onRouteChange(to: any, from: any, next: any) {
      if (this.$route.name !== to.name) {
        await this.$store.dispatch("cluster/forgetType", EVENT);
      }
      next();
    },

    onApiFilter(pagination: Pagination) {
      if (!pagination.projectsOrNamespaces || !pagination.projectsOrNamespaces[0]) {
        pagination.projectsOrNamespaces = [{ fields: [] }];
      }

      pagination.projectsOrNamespaces[0].fields = [
        {
          equals: true,
          exact: true,
          exists: false,
          field: undefined,
          value: "longhorn-system",
        },
      ];

      return pagination;
    },
  },
});
</script>

<template>
  <h3 class="title">
    {{ t("longhorn.dashboard.events") }}
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
