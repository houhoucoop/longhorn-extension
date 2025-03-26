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
      // we were missing the headers here to display the list view
      headers: [
        STATE,
        NAME_COL,
        AGE
      ]
    }
  },

  computed: {
    rows() {
      console.error("🚀🚀🚀🚀🚀 ~ rows ~ this.resource:", this.resource)
      console.error("🚀🚀🚀🚀🚀 ~ rows ~ this.$store.getters['cluster/all'](this.resource):", this)
      return this.$store.getters['cluster/all'](this.resource);
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