import {
  PRODUCT_NAME,
  LONGHORN_DASHBOARD,
  LONGHORN_PAGES,
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
          namespaced: true
        },
        metadata: { name: 'nodes' },
        collectionMethods: ['GET', 'POST', 'PUT', 'DELETE'],
        resourceFields: {},
      },
    ],
    getInstances: async() => {
      const inStore = store.getters['currentProduct'].inStore;
      const res = await store.dispatch(`${inStore}/request`, {
        opt: {
          url: '/k8s/clusters/c-nxn6c/api/v1/namespaces/longhorn-system/services/http:longhorn-frontend:80/proxy/v1/nodes',
        }
      });

      return res.data
    },
    route:      {
      name:   `c-cluster-${ PRODUCT_NAME }-resource`,
      params: {
        product: PRODUCT_NAME,
        resource: LONGHORN_PAGES.NODE,
      }
    },
  });

  configureType(LONGHORN_PAGES.VOLUME, {
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
        resource: LONGHORN_PAGES.VOLUME
      }
    }
  });

  // registering the defined pages as side-menu entries
  basicType([
    LONGHORN_DASHBOARD,
    LONGHORN_PAGES.NODE,
    LONGHORN_PAGES.VOLUME,
  ]);
}
