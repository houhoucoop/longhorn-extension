import { importTypes } from '@rancher/auto-import';
import { IPlugin } from '@shell/core/types';
import longhornStore from './store/longhorn';
import longhornRoutes from './routes/longhorn';

// Init the package
export default function(plugin: IPlugin) {
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
}