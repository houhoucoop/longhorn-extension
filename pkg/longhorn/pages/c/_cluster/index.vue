<script>
import { mapGetters } from 'vuex';
import { SERVICE } from '@shell/config/types';
import IconMessage from '@shell/components/IconMessage';
import LazyImage from '@shell/components/LazyImage';
import Loading from '@shell/components/Loading';

export default {
  name: 'Dashboard',

  async fetch() {
    if (this.$store.getters['cluster/schemaFor'](SERVICE)) {
      this.uiServices = await this.$store.dispatch('cluster/findMatching', {
        type:     SERVICE,
        selector: 'app=longhorn-ui'
      });
    }
  },

  data() {
    return {
      longhornImgSrc: require('~shell/assets/images/vendor/longhorn.svg'),
      uiServices:     null
    };
  },

  computed: {
    ...mapGetters(['currentCluster']),

    externalLinks() {
      if ( this.uiServices && this.uiServices.length === 1 && this.uiServices[0].metadata?.namespace ) {
        return [
          {
            enabled:     true,
            iconSrc:     this.longhornImgSrc,
            label:       'longhorn.overview.linkedList.longhorn.label', // i18n-uses longhorn.overview.linkedList.longhorn.label
            description: 'longhorn.overview.linkedList.longhorn.description', // i18n-uses longhorn.overview.linkedList.longhorn.description
            link:        `/k8s/clusters/${ this.currentCluster.id }/api/v1/namespaces/${ this.uiServices[0].metadata.namespace }/services/http:longhorn-frontend:80/proxy/`
          },
        ];
      }

      return [];
    }
  }
};
</script>

<template>
  <div>Longhorn Dashboard</div>
</template>
