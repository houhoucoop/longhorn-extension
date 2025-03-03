import { IPlugin } from '@shell/core/types';
import { PRODUCT_NAME, LONGHORN_RESOURCES } from '../types/longhorn'

export function init($plugin: IPlugin, store: any) {
  const CUSTOM_PAGE_NAME = 'page1';

  const {
    product,
    basicType
  } = $plugin.DSL(store, PRODUCT_NAME);

  product({
    icon:    'longhorn',
    inStore: 'cluster',
  });

  // registering the defined pages as side-menu entries
  basicType([LONGHORN_RESOURCES.NODE]);
}
