import { IPlugin } from '@shell/core/types';
import { PRODUCT_NAME, LONGHORN_DASHBOARD, LONGHORN_RESOURCES } from '../types/longhorn'

export function init($plugin: IPlugin, store: any) {
  const CUSTOM_PAGE_NAME = 'page1';

  const {
    product,
    basicType,
    virtualType
  } = $plugin.DSL(store, PRODUCT_NAME);

  product({
    icon:    'longhorn',
    inStore: 'cluster',
  });

  // TODO: replace the dashboard page when the config is removed from the shell
  virtualType({
    label:       store.getters['i18n/t']('longhorn.dashboard.title'),
    name:        LONGHORN_DASHBOARD,
    route:  {
      name:   `c-cluster-${ PRODUCT_NAME }-${ LONGHORN_DASHBOARD }`,
      params: { product: PRODUCT_NAME }
    }
  });

  // registering the defined pages as side-menu entries
  basicType([LONGHORN_DASHBOARD, LONGHORN_RESOURCES.NODE]);
}
