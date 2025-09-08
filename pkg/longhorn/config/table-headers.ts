import { STATE, NAME as NAME_COL } from "@shell/config/table-headers";

export const ENGINE_IMAGES_HEADER = [
  STATE,
  NAME_COL,
  {
    name: "image",
    labelKey: "longhorn.engineImage.fields.image",
    value: "spec.image",
    sort: "spec.image",
  },
  {
    name: "status",
    labelKey: "longhorn.engineImage.fields.status",
    value: "status.state",
    sort: "status.state",
  },
  {
    name: "default",
    labelKey: "longhorn.engineImage.fields.default",
    value: "isDefault",
    formatter: "Checked",
    align: "center",
  },
  {
    name: "refCount",
    labelKey: "longhorn.engineImage.fields.refCount",
    value: "status.refCount",
    align: "center",
    sort: "status.refCount",
  },
  {
    name: "buildDate",
    labelKey: "longhorn.engineImage.fields.buildDate",
    value: "status.buildDate",
    formatterOpts: { addSuffix: true },
    formatter: "LiveDate",
    sort: "status.buildDate",
  },
];
