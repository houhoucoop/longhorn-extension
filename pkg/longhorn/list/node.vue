<script>
import Loading from '@shell/components/Loading';
import ResourceTable from '@shell/components/ResourceTable';
import { STATE, NAME as NAME_COL, AGE } from '@shell/config/table-headers';
import { PRODUCT_NAME } from '../types/longhorn';

export default {
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

	async fetch () {
    const inStore = this.$store.getters['currentProduct'].inStore;
    const nodes = await this.$store.dispatch(`${ inStore }/findAll`, { type: this.resource })
		this.rows = nodes
	},

  data() {
    return {
      // we were missing the headers here to display the list view
      headers: [
        STATE,
        NAME_COL,
        AGE
      ],
			rows: []
    }
  },

  computed: {

  }
};
</script>

<template>
	<Loading v-if="$fetchState.pending" />
  <div v-else>
    <ResourceTable
      :rows="rows"
      :headers="headers"
    />
  </div>
</template>