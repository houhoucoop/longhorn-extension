import {
  PRODUCT_NAME,
  LONGHORN_DASHBOARD,
  LONGHORN_RESOURCES,
} from "../types/longhorn";

export function init($plugin: any, store: any) {
  const { product, basicType, spoofedType, configureType, virtualType, headers  } = $plugin.DSL(
    store,
    PRODUCT_NAME
  );

  product({
    removable: true,
    public: true,
    icon: "longhorn",
    inStore: 'cluster',
  });

  spoofedType({
    label: "Nodes (Custom)",
    name: LONGHORN_RESOURCES.NODE,
    type: LONGHORN_RESOURCES.NODE,
    product: PRODUCT_NAME,
    schemas: [
      {
        id: LONGHORN_RESOURCES.NODE,
        type: "schema",
        attributes: {
          kind: LONGHORN_RESOURCES.NODE,
          namespaced: true
        },
        metadata: { name: 'nodes' },
        collectionMethods: ['GET', 'POST', 'PUT', 'DELETE'],
        resourceFields: {},
      },
    ],
    // this method allows you to load the resource instances for the spoofed type...
    getInstances: async() => {
      // this commented out code is another way of loading whatever represents LONGHORN_RESOURCES.VOLUME
      //
      // let resources = [];

      // if (store.getters['cluster/schemaFor'](LONGHORN_RESOURCES.VOLUME)) {
      //   resources = await store.dispatch('cluster/findAll', { type: LONGHORN_RESOURCES.VOLUME });
      // }

      // console.error('RESOURCES LOAD FOR SPOOFED TYPE', resources)

      // return resources;

      const inStore = store.getters['currentProduct'].inStore;
      console.error('getInstances inStore', inStore)
      const res = await store.dispatch(`${inStore}/request`, {
        opt: {
          prependPath: '/k8s/clusters/c-nxn6c/api/v1/namespaces/longhorn-system/services/http:longhorn-frontend:80/proxy',
          url: '/v1/nodes',
          shouldMapResources: true,
        },
        type: 'nodes'
      });

      console.error('getInstances res', res)

      return res.data
    },
    // this is needed so that the browser refresh works on this page
    route:      {
      name:   `c-cluster-${ PRODUCT_NAME }-resource`,
      params: {
        product: PRODUCT_NAME,
        resource: LONGHORN_RESOURCES.NODE,
      }
    },
  });

  configureType(LONGHORN_RESOURCES.VOLUME, {
    displayName: 'volumes',
    isCreatable: true,
    isEditable:  true,
    isRemovable: true,
    showAge:     true,
    showState:   true,
    canYaml:     true,
    customRoute: {
      name: `c-cluster-${ PRODUCT_NAME }-resource`,
      params: {
        product: PRODUCT_NAME,
        resource: LONGHORN_RESOURCES.VOLUME
      }
    }
  });

  // registering the defined pages as side-menu entries
  basicType([
    LONGHORN_DASHBOARD, // this isn't doing anything if don't register a virtualType page to display a custom view for longhorn dashboard
    LONGHORN_RESOURCES.NODE,
    LONGHORN_RESOURCES.VOLUME,
  ]);
}
