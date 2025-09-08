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
    const hash = {
      engineImages: this.$store.dispatch(`${inStore}/findAll`, {
        type: this.resource,
      }),
      defaultEngineImage: this.$store.dispatch(`${inStore}/find`, {
        type: LONGHORN_RESOURCES.SETTINGS,
        id: LONGHORN_RESOURCE_IDS.DEFAULT_ENGINE_IMAGE,
      }),
    };
    const res = await allHash(hash);

    this.rows = res.engineImages;
  },

  data() {
    return {
      rows: [],
    };
  },
};
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else>
    <ResourceTable :rows="rows" :schema="schema" />
  </div>
</template>
