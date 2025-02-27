import ListResource from '@shell/pages/c/_cluster/_product/_resource/index.vue';
import CreateResource from '@shell/pages/c/_cluster/_product/_resource/create.vue';
import ViewResource from '@shell/pages/c/_cluster/_product/_resource/_id.vue';
import ViewNamespacedResource from '@shell/pages/c/_cluster/_product/_resource/_namespace/_id.vue';
import Dashboard from '../pages/c/_cluster/index.vue';
import { PRODUCT_NAME } from '../types/longhorn'

const CUSTOM_PAGE_NAME = 'page1';

const routes = [
  {
    name:       `c-cluster-${ PRODUCT_NAME }`,
    path:       `/c/:cluster/${ PRODUCT_NAME }`,
    component:  Dashboard,
    meta:       { product: PRODUCT_NAME, pkg: PRODUCT_NAME }
  },
  // registering routes for list/edit/create views
  {
    name:      `c-cluster-${ PRODUCT_NAME }-resource`,
    path:      `/c/:cluster/${ PRODUCT_NAME }/:resource`,
    component: ListResource,
    meta:      { product: PRODUCT_NAME },
  },
  {
    name:      `c-cluster-${ PRODUCT_NAME }-resource-create`,
    path:      `/c/:cluster/${ PRODUCT_NAME }/:resource/create`,
    component: CreateResource,
    meta:      { product: PRODUCT_NAME },
  },
  {
    name:      `c-cluster-${ PRODUCT_NAME }-resource-id`,
    path:      `/c/:cluster/${ PRODUCT_NAME }/:resource/:id`,
    component: ViewResource,
    meta:      { product: PRODUCT_NAME },
  },
  {
    name:      `c-cluster-${ PRODUCT_NAME }-resource-namespace-id`,
    path:      `/:cluster/${ PRODUCT_NAME }/:resource/:namespace/:id`,
    component: ViewNamespacedResource,
    meta:      { product: PRODUCT_NAME },
  }
];

export default routes;