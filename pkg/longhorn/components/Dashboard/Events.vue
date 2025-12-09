<script>
import {
  MESSAGE,
  NAME,
  OBJECT,
  REASON,
  EVENT_TYPE,
} from "@shell/config/table-headers";
import { EVENT } from "@shell/config/types";
import PaginatedResourceTable from "@shell/components/PaginatedResourceTable";
import {
  STEVE_NAME_COL,
} from "@shell/config/pagination-table-headers";
import { headerFromSchemaColString } from "@shell/store/type-map.utils";
import { NAME as EXPLORER } from "@shell/config/product/explorer";

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

export default {
  components: { PaginatedResourceTable },

  data() {
    return {
      schema: null,
      events: [],
      eventHeaders,
      paginationHeaders: null,
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
              true
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
          headerFromSchemaColString(
            "Source",
            schema,
            this.$store.getters,
            true
          ),
          MESSAGE,
        ]
      : [];

    this.schema = schema;
    this.paginationHeaders = paginationHeaders;
  },

  mounted() {
    this.dismissRouteHandler = this.$router.beforeEach(this.onRouteChange);
  },

  methods: {
    async onRouteChange(to, from, next) {
      if (this.$route.name !== to.name) {
        await this.$store.dispatch("cluster/forgetType", EVENT);
      }

      next();
    },

    onApiFilter(pagination) {
      if (
        !pagination.projectsOrNamespaces ||
        !pagination.projectsOrNamespaces[0]
      ) {
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

  beforeUnmount() {
    this.dismissRouteHandler();
  },
};
</script>

<template>
  <h3 class="mt-40 mb-24">
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
.events-link {
  align-self: center;
  padding-right: 20px;
  white-space: nowrap;
}
</style>
