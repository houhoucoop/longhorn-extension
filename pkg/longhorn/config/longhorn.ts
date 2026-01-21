import {
  PRODUCT_NAME,
  LONGHORN_PAGES,
  LONGHORN_GROUP,
} from "@longhorn/types/longhorn";
import { LONGHORN_RESOURCES } from "@longhorn/types/resources";
import {
  ENGINE_IMAGES_HEADER,
  NODES_HEADER,
  RECURRING_JOBS_HEADER,
} from "./table-headers";

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

  // ----- Product Configuration ----- //
  product({
    ifHaveGroup: "longhorn.io",
    removable: true,
    public: true,
    icon: "longhorn",
    inStore: "cluster",
    inExplorer: false,
  });

  // ----- Pages ----- //
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

  // Recurring Jobs
  configureType(LONGHORN_RESOURCES.RECURRING_JOBS, {
    isCreatable: true,
    isEditable: true,
  });
  mapType(LONGHORN_RESOURCES.RECURRING_JOBS, LONGHORN_PAGES.RECURRING_JOBS);
  headers(LONGHORN_RESOURCES.RECURRING_JOBS, RECURRING_JOBS_HEADER);

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

  // ----- Advanced group pages ----- //
  // Engine Images
  configureType(LONGHORN_RESOURCES.ENGINE_IMAGES, {
    isCreatable: true,
    isEditable: false,
    isRemovable: false
  });
  mapType(LONGHORN_RESOURCES.ENGINE_IMAGES, LONGHORN_PAGES.ENGINE_IMAGES);
  headers(LONGHORN_RESOURCES.ENGINE_IMAGES, ENGINE_IMAGES_HEADER);

  // Instance Managers
  configureType(LONGHORN_RESOURCES.INSTANCE_MANAGER, {
    isEditable: false,
    isRemovable: false,
    canYaml: false,
  });
  mapType(LONGHORN_RESOURCES.INSTANCE_MANAGER, LONGHORN_PAGES.INSTANCE_MANAGER);

  // ----- Sidebar configuration ----- //
  basicType([
    LONGHORN_PAGES.DASHBOARD,
    LONGHORN_RESOURCES.NODES,
    LONGHORN_RESOURCES.RECURRING_JOBS,
    LONGHORN_PAGES.SETTINGS,
  ]);
  basicType(
    [LONGHORN_RESOURCES.ENGINE_IMAGES, LONGHORN_RESOURCES.INSTANCE_MANAGER],
    LONGHORN_GROUP.ADVANCED
  );
  weightType(LONGHORN_PAGES.DASHBOARD, 999, true);
  weightType(LONGHORN_RESOURCES.NODES, 800, true);
  weightType(LONGHORN_RESOURCES.RECURRING_JOBS, 700, true);
}
