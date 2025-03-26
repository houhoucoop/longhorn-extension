<script>
import Loading from '@shell/components/Loading';
import ResourceTable from '@shell/components/ResourceTable';

export default {
  name: 'Nodes',

	components: {
    Loading,
		ResourceTable
  },

  props: {
    resource: {
      type:     String,
      required: true,
    },
    schema: {
      type:     Object,
      required: true,
    },
  },

  async fetch() {
    const inStore = this.$store.getters['currentProduct'].inStore;
    const res = await this.$store.dispatch(`${inStore}/request`, {
      opt: {
        prependPath: '/k8s/clusters/c-nxn6c/api/v1/namespaces/longhorn-system/services/http:longhorn-frontend:80/proxy',
        url: '/v1/nodes',
        shouldMapResources: true,
      },
      type: 'nodes'
    });

    this.rows = res;
  },

  data() {
    return {
      rows: [],
    };
  },

  computed: {
    rows() {
      console.log("🚀🚀🚀🚀🚀 ~ rows ~ this:", this)
      return this.rows;
    },
  }
};
</script>

<template>
	<Loading v-if="$fetchState.pending" />
  <div v-else>
    <ResourceTable
      :rows="rows"
			:schema="schema"
    />
  </div>
</template>