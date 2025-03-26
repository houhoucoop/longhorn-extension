import {
  PRODUCT_NAME,
  LONGHORN_DASHBOARD,
  LONGHORN_RESOURCES,
} from "../types/longhorn";

export function init($plugin: any, store: any) {
  const { product, basicType, spoofedType, configureType, virtualType } = $plugin.DSL(
    store,
    PRODUCT_NAME
  );

  product({
    removable: true,
    public: true,
    icon: "longhorn",
    inStore: PRODUCT_NAME,
  });

  spoofedType({
    label: "Nodes (Custom)",
    name: "nodes",
    type: "nodes",
    product: PRODUCT_NAME,
    schemas: [
      {
        id: "nodes",
        type: "schema",
        attributes: {
          kind: "Nodes",
          namespaced: true
        },
        collectionMethods: [],
        resourceFields: {},
      },
    ],
  });

  configureType(LONGHORN_RESOURCES.NODE, {
    displayName: 'resourceNodes',
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
        resource: LONGHORN_RESOURCES.NODE
      }
    }
  });

  // registering the defined pages as side-menu entries
  basicType([
    LONGHORN_DASHBOARD,
    "nodes",
    LONGHORN_RESOURCES.NODE
  ]);
}
