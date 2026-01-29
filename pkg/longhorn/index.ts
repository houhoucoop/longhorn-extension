import { importTypes } from '@rancher/auto-import';
import { IPlugin, OnNavToPackage, OnNavAwayFromPackage } from '@shell/core/types';
import longhornStore from './store';
import longhornRoutes from './routes/longhorn';

const onEnter: OnNavToPackage = async (store, config) => {
  // define any function needed here for `onEnter`
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
