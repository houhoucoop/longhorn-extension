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

  data() {
    return {
      headers: [
        STATE,
        NAME_COL,
        AGE
      ]
    }
  },

  computed: {
    rows() {
			return this.$store.getters[`${PRODUCT_NAME}/nodes`](this.resource)
    }
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