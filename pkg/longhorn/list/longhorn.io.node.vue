<script>
import Loading from '@shell/components/Loading';
import ResourceTable from '@shell/components/ResourceTable';
import CreateEditView from '@shell/mixins/create-edit-view';

export default {
	components: {
    Loading,
		ResourceTable
  },

  mixins: [CreateEditView],

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
    const res = await this.$store.dispatch(`${ inStore }/findAll`, { type: this.resource })
    console.log("🚀🚀🚀🚀🚀 ~ fetch ~ res:", res)
    this.rows = res;
  },

  data() {
    return {
      rows: [],
    };
  },

  computed: {
    rows() {
      return this.rows;
    }
  }
};
</script>

<template>
	<Loading v-if="$fetchState.pending" />
  <div v-else>
    resource node page
    <ResourceTable
      :rows="rows"
      :schema="schema"
    />
  </div>
</template>