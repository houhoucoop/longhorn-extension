import { importTypes } from '@rancher/auto-import';
import { IPlugin, OnNavToPackage, OnNavAwayFromPackage } from '@shell/core/types';
import longhornStore from './store';
import longhornRoutes from './routes/longhorn';
import { PRODUCT_NAME } from '@longhorn/types/longhorn';

let namespacePluginRegistered = false;

const registerNamespacePlugin = (store: any) => {
  if (namespacePluginRegistered) {
    return;
  }
  namespacePluginRegistered = true;

  let isClearing = false;

  store.subscribe((mutation: any, state: any) => {
    const currentProduct = store.getters['currentProduct'];

    if (currentProduct?.name !== PRODUCT_NAME) {
      return;
    }

    // Intercept updateNamespaces mutation to prevent namespace filtering in Longhorn product
    // Longhorn resources are all in longhorn-system namespace, so namespace filtering is not applicable
    if (mutation.type === 'updateNamespaces' && !isClearing) {
      if (mutation.payload?.filters && mutation.payload.filters.length > 0) {
        isClearing = true;
        store.commit('updateNamespaces', { filters: [], all: state.allNamespaces });
        isClearing = false;
      }
    }
  });
};

const onEnter: OnNavToPackage = async (store, config) => {
  // Register namespace filter plugin on first entry
  registerNamespacePlugin(store);

  // Clear namespace filters when entering Longhorn product
  store.commit('updateNamespaces', { filters: [], all: store.state.allNamespaces });
};

const onLeave: OnNavAwayFromPackage = async (store, config) => {
  // define any function needed here for `onLeave`
};

// Init the package
export default function (plugin: IPlugin) {
  // Auto-import model, detail, edit from the folders
  importTypes(plugin);

  // Provide extension metadata from package.json
  // it will grab information such as `name` and `description`
  plugin.metadata = require('./package.json');

  // Load a product
  plugin.addProduct(require('./config/longhorn'));

  // Add Vuex store
  plugin.addDashboardStore(longhornStore.config.namespace, longhornStore.specifics, longhornStore.config);

  // Add Vue Routes
  plugin.addRoutes(longhornRoutes);

  // Add hooks to Vue navigation world
  plugin.addNavHooks(onEnter, onLeave);
}
