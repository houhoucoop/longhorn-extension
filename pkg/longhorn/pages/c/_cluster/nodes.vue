<script>
import axios from 'axios';
import ResourceTable from '@shell/components/ResourceTable';
import { LONGHORN_RESOURCES } from '../../../types/longhorn'
import { NAME, AGE, NAMESPACE, STATE } from '@shell/config/table-headers';

export default {
  name: 'Node',

  components: {
    ResourceTable,
  },

  data() {
    console.log("🚀🚀🚀🚀🚀 ~ data ~ rows:", this)
    return {
      nodes: [],
      schema: this.$store.getters[`cluster/schemaFor`](LONGHORN_RESOURCES.NODE),
      headers: [
        {
          name: "name",
          label: "Name"
        },
        {
          name: "allowScheduling",
          label: "AllowScheduling"
        },
        {
          name: "test",
          label: "test",
          value: 'disks.default-disk-1030100000000.diskType',
          // getValue:      (row) => row.spec?.nodeName,
          // sort:          'spec.nodeName',
          // formatter:     'LinkName',
          // formatterOpts: { type: NODE_TYPE },
        },
      ]
    };
  },

  async created() {
    try {
      const response = await axios.get(
        'https://localhost:8005/k8s/clusters/c-nxn6c/api/v1/namespaces/longhorn-system/services/http:longhorn-frontend:80/proxy/v1/nodes',
        {
          headers: {'Accept': 'application/json',},
        }
      );
      this.nodes = response.data.data;
    } catch (error) {
      console.error('Error fetching nodes:', error.message || 'Failed to fetch nodes');
    }
  }
};
</script>

<template>
  <div>
    <ResourceTable
      :rows="nodes"
      :schema="schema"
      :headers="headers"
    >
      <template v-slot:row-actions>
        <div style="background: red; color: white">Row actions slot</div>
      </template>
    </ResourceTable>
  </div>
</template>
