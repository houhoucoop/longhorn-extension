<script>
import Loading from '@shell/components/Loading';
import ResourceTable from '@shell/components/ResourceTable';

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

  computed: {
    rows() {
      console.log("🚀🚀🚀🚀🚀 ~ rows ~ this.$store.getters['cluster/all'](this.resource):", this)
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
    />
  </div>
</template>