import { CoreStoreSpecifics, CoreStoreConfig } from '@shell/core/types';
import getters from './getters';
import mutations from './mutations';
import actions from './actions';
import { PRODUCT_NAME } from '../../types/longhorn';

const longhornFactory = (): CoreStoreSpecifics => {
  return {
    state() {
      return { someStateVariable: '' };
    },

    getters: { ...getters },
    mutations: { ...mutations },
    actions: { ...actions },
  };
};
const config: CoreStoreConfig = {
	namespace: PRODUCT_NAME,
};

export default {
  specifics: longhornFactory(),
  config
};