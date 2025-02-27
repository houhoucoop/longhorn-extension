import { IPlugin } from '@shell/core/types';
import { PRODUCT_NAME } from '../types/longhorn'

export function init($plugin: IPlugin, store: any) {
  const YOUR_K8S_RESOURCE_NAME = 'provisioning.cattle.io.cluster';
  const CUSTOM_PAGE_NAME = 'page1';

  const {
    product,
    basicType
  } = $plugin.DSL(store, PRODUCT_NAME);

  // registering a cluster-level product
  product({
    icon:    'gear',
    inStore: 'cluster', // this is what defines the extension as a cluster-level product
    weight:  100,
    to:      {
      name:   `c-cluster-${ PRODUCT_NAME }-${ CUSTOM_PAGE_NAME }`,
      params: { product: PRODUCT_NAME }
    }
  });

  // registering the defined pages as side-menu entries
  basicType([YOUR_K8S_RESOURCE_NAME, CUSTOM_PAGE_NAME]);
}
