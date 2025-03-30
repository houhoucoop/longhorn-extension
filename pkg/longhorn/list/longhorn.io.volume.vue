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
      const volumes = this.$store.getters['cluster/all'](this.resource)
      return volumes;
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