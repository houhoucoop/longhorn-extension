import {
  PRODUCT_NAME,
  LONGHORN_DASHBOARD,
  LONGHORN_PAGES,
  LONGHORN_RESOURCES
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
    name: LONGHORN_PAGES.NODE,
    type: LONGHORN_PAGES.NODE,
    product: PRODUCT_NAME,
    schemas: [
      {
        id: LONGHORN_PAGES.NODE,
        type: "schema",
        attributes: {
          kind: LONGHORN_PAGES.NODE,
        },
        metadata: { name: 'nodes' },
        collectionMethods: ['GET', 'POST', 'PUT', 'DELETE'],
        resourceFields: {},
      },
    ],
    getInstances: async() => {
      const currentStore = store.getters['currentProduct'].inStore;
      const response = await store.dispatch(`${currentStore}/request`, {
        opt: {
          url: '/k8s/clusters/c-nxn6c/api/v1/namespaces/longhorn-system/services/http:longhorn-frontend:80/proxy/v1/nodes',
        },
      });
      const formattedNodes = await store.dispatch(`${PRODUCT_NAME}/formatNodes`, response);
      return formattedNodes?.data || [];
    },
    route:      {
      name:   `c-cluster-${ PRODUCT_NAME }-resource`,
      params: {
        product: PRODUCT_NAME,
        resource: LONGHORN_PAGES.NODE,
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
    LONGHORN_DASHBOARD,
    LONGHORN_PAGES.NODE,
    LONGHORN_RESOURCES.VOLUME,
  ]);
}
