import {
  PRODUCT_NAME,
  LONGHORN_PAGES,
} from "@longhorn/types/longhorn";
import { LONGHORN_RESOURCES } from "@longhorn/types/resources";
import { ENGINE_IMAGES_HEADER } from "./table-headers";

export function init($plugin: any, store: any) {
  const { product, basicType, configureType, virtualType, mapType, headers } =
    $plugin.DSL(store, PRODUCT_NAME);

  product({
    ifHaveGroup: "longhorn.io",
    removable: true,
    public: true,
    icon: "longhorn",
    inStore: "cluster",
    inExplorer: false,
  });

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

  configureType(LONGHORN_RESOURCES.ENGINE_IMAGES, {
    isEditable: false,
    canYaml: false,
  });
  mapType(LONGHORN_RESOURCES.ENGINE_IMAGES, LONGHORN_PAGES.ENGINE_IMAGES);
  headers(LONGHORN_RESOURCES.ENGINE_IMAGES, ENGINE_IMAGES_HEADER);

  // registering the defined pages as side-menu entries
  basicType([LONGHORN_PAGES.DASHBOARD, LONGHORN_RESOURCES.ENGINE_IMAGES]);
}
