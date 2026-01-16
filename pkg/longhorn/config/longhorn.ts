import {
  PRODUCT_NAME,
  LONGHORN_PAGES,
  LONGHORN_GROUP,
} from "@longhorn/types/longhorn";
import { LONGHORN_RESOURCES } from "@longhorn/types/resources";
import { ENGINE_IMAGES_HEADER, NODES_HEADER } from "./table-headers";

export function init($plugin: any, store: any) {
  const {
    product,
    basicType,
    configureType,
    virtualType,
    mapType,
    headers,
    weightType,
  } = $plugin.DSL(store, PRODUCT_NAME);

  product({
    ifHaveGroup: "longhorn.io",
    removable: true,
    public: true,
    icon: "longhorn",
    inStore: "cluster",
    inExplorer: false,
  });

  // Dashboard
  virtualType({
    name: LONGHORN_PAGES.DASHBOARD,
    route: {
      name: `c-cluster-${PRODUCT_NAME}`,
      params: { product: PRODUCT_NAME },
      meta: {
        pkg: PRODUCT_NAME,
        product: PRODUCT_NAME,
      },
    },
  });

  // Nodes
  configureType(LONGHORN_RESOURCES.NODES, {
    isCreatable: false,
    isEditable: true,
    canYaml: false,
  });
  mapType(LONGHORN_RESOURCES.NODES, LONGHORN_PAGES.NODES);
  headers(LONGHORN_RESOURCES.NODES, NODES_HEADER);

  // Engine Images
  configureType(LONGHORN_RESOURCES.ENGINE_IMAGES, {
    isEditable: false,
    canYaml: false,
  });
  mapType(LONGHORN_RESOURCES.ENGINE_IMAGES, LONGHORN_PAGES.ENGINE_IMAGES);
  headers(LONGHORN_RESOURCES.ENGINE_IMAGES, ENGINE_IMAGES_HEADER);

  // Settings
  virtualType({
    name: LONGHORN_PAGES.SETTINGS,
    route: {
      name: `c-cluster-${PRODUCT_NAME}-${LONGHORN_RESOURCES.SETTINGS}`,
      params: {
        product: PRODUCT_NAME,
      },
    },
  });

  // Instance Managers
  configureType(LONGHORN_RESOURCES.INSTANCE_MANAGER, {
    isEditable: false,
    isRemovable: false,
    canYaml: false,
  });
  mapType(LONGHORN_RESOURCES.INSTANCE_MANAGER, LONGHORN_PAGES.INSTANCE_MANAGER);
  // headers(LONGHORN_RESOURCES.INSTANCE_MANAGER, ENGINE_IMAGES_HEADER);

  // registering the defined pages as side-menu entries
  basicType([
    LONGHORN_PAGES.DASHBOARD,
    LONGHORN_RESOURCES.NODES,
    LONGHORN_PAGES.SETTINGS,
  ]);
  weightType(LONGHORN_PAGES.DASHBOARD, 999, true);
  weightType(LONGHORN_RESOURCES.NODES, 800, true);
  basicType(
    [LONGHORN_RESOURCES.ENGINE_IMAGES, LONGHORN_RESOURCES.INSTANCE_MANAGER],
    LONGHORN_GROUP.ADVANCED
  );
}
