// @ts-nocheck
import { CoreStoreSpecifics, CoreStoreConfig } from '@shell/core/types';
import { steveStoreInit } from '@shell/plugins/steve/index';
import getters from './getters';
import mutations from './mutations';
import actions from './actions';
import { PRODUCT_NAME } from '../types/longhorn';
import { actions as subscribeActions, getters as subscribeGetters } from './subscribe-shims';

const longhornFactory = (): CoreStoreSpecifics => {
  return {
    state() {
      return {};
    },

    getters: {
      ...getters,
      ...subscribeGetters
    },

    mutations: {
      ...mutations
    },

    actions: {
      ...actions,
      ...subscribeActions
    },
  };
};

const config: CoreStoreConfig = {
	namespace: PRODUCT_NAME,
  // this can't be used... It appears that we cannot "extend" the cluster store
  // isClusterStore: true
};

export default {
  specifics: longhornFactory(),
  config,
};