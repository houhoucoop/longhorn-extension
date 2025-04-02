<script>
import Loading from '@shell/components/Loading';
import ResourceTable from '@shell/components/ResourceTable';
import { STATE, NAME as NAME_COL, AGE } from '@shell/config/table-headers';

export default {
  components: {
    Loading,
    ResourceTable
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
    const inStore = this.$store.getters['currentProduct'].inStore;
    const nodes = await this.$store.dispatch(`${inStore}/findAll`, { type: this.resource });
    this.rows = nodes;
  },

  data() {
    return {
      headers: [STATE, NAME_COL, AGE],
      rows: []
    };
  },

  computed: {
    renderAllowScheduling() {
      return this.rows.some((node) => node.spec?.allowScheduling);
    }
  }
};
</script>

<template>
  <Loading v-if="$fetchState.pending" />
  <div v-else>
    <ResourceTable :rows="rows" :headers="headers" />
    <p>{{ renderAllowScheduling ? 'renderAllowScheduling: true' : 'renderAllowScheduling: false' }}</p>
  </div>
</template>
