import { PRODUCT_NAME, LONGHORN_PAGES } from "../types/longhorn";
import { LONGHORN_RESOURCES } from "../types/resources";
import { ENGINE_IMAGES_HEADER } from "./table-headers";

export function init($plugin: any, store: any) {
  const { product, basicType, configureType, mapType, headers } = $plugin.DSL(
    store,
    PRODUCT_NAME
  );

  product({
    removable: true,
    public: true,
    icon: "longhorn",
    inStore: "cluster",
  });

  configureType(LONGHORN_RESOURCES.ENGINE_IMAGES, {
    isEditable: false,
    showAge: false,
    canYaml: false,
  });
  mapType(LONGHORN_RESOURCES.ENGINE_IMAGES, LONGHORN_PAGES.ENGINE_IMAGES);
  headers(LONGHORN_RESOURCES.ENGINE_IMAGES, ENGINE_IMAGES_HEADER);

  // registering the defined pages as side-menu entries
  basicType([
    LONGHORN_RESOURCES.NODES,
    LONGHORN_RESOURCES.VOLUMES,
    LONGHORN_RESOURCES.ENGINE_IMAGES,
    // LONGHORN_PAGES.ENGINE_IMAGES
  ]);
}
