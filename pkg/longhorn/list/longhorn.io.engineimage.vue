<script>
import Loading from "@shell/components/Loading";
import ResourceTable from "@shell/components/ResourceTable";
import { allHash } from "@shell/utils/promise";
import { LONGHORN_RESOURCES, LONGHORN_RESOURCE_IDS } from "../types/resources";

export default {
  name: "ListEngineImage",

  components: {
    Loading,
    ResourceTable,
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
    const inStore = this.$store.getters["currentProduct"].inStore;

    await allHash({
      engineImages: this.$store.dispatch(`${inStore}/findAll`, { type: this.resource }),
      defaultEngineImage: this.$store.dispatch(`${inStore}/find`, {
        type: LONGHORN_RESOURCES.SETTINGS,
        id: LONGHORN_RESOURCE_IDS.DEFAULT_ENGINE_IMAGE,
      }),
    });
  },

  computed: {
    rows() {
      const inStore = this.$store.getters["currentProduct"].inStore;
      return this.$store.getters[`${inStore}/all`](this.resource) || [];
    },
  },
};
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else>
    <ResourceTable :rows="rows" :schema="schema" />
  </div>
</template>
