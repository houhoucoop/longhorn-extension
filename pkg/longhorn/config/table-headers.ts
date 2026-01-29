import {
  STATE,
  NAME as NAME_COL,
  AGE,
  IMAGE_NAME,
  STATUS,
} from "@shell/config/table-headers";

export const NODES_HEADER = [
  STATE,
  {
    ...NAME_COL,
    width: 200,
  },
  {
    name: "ready",
    labelKey: "longhorn.node.table.header.ready",
    search: "$.status.conditions[?(@.type=='Ready')].status",
    sort: ["$.status.conditions[?(@.type=='Ready')].status"],
    value: "$.status.conditions[?(@.type=='Ready')].status",
    width: 80,
    align: "center",
  },
  {
    name: "schedulable",
    labelKey: "longhorn.node.table.header.schedulable",
    value: "spec.allowScheduling",
    sort: "spec.allowScheduling",
    search: "spec.allowScheduling",
    formatter: "CapitalizedValue",
    width: 100,
    align: "center",
  },
  {
    name: "replicas",
    labelKey: "longhorn.node.table.header.replicas",
    value: "replicas",
    formatter: "Link",
    width: 80,
    align: "center",
  },
  {
    name: "allocated",
    labelKey: "longhorn.node.table.header.allocated",
    value: "disksAllocated",
    formatter: "ConsumptionGauge",
  },
  {
    name: "used",
    labelKey: "longhorn.node.table.header.used",
    value: "disksUsed",
    formatter: "ConsumptionGauge",
  },
  {
    name: "size",
    labelKey: "longhorn.node.table.header.size",
    value: "disksSize",
    formatter: "DiskSize",
    width: 200,
    align: "center",
  },
  {
    name: "tags",
    labelKey: "longhorn.node.table.header.tags",
    value: "spec.tags",
    formatter: "Tag",
  },
  AGE,
];

export const DISKS_HEADERS = [
  {
    name: "schedulable",
    labelKey: "longhorn.node.table.header.schedulable",
    value: "allowScheduling",
    sort: "allowScheduling",
    search: "allowScheduling",
    formatter: "CapitalizedValue",
    width: 100,
    align: "center",
  },
  {
    name: "id",
    labelKey: "longhorn.node.table.header.diskId",
    value: "id",
    sort: ["id"],
    width: 200,
  },
  {
    name: "diskType",
    labelKey: "longhorn.node.table.header.diskType",
    value: "diskType",
    width: 100,
  },
  {
    name: "path",
    labelKey: "longhorn.node.table.header.path",
    value: "path",
    sort: ["path"],
    width: 100,
  },
  {
    name: "replicas",
    labelKey: "longhorn.node.table.header.replicas",
    value: "scheduledReplicaCounts",
    formatter: "Link",
    width: 80,
    align: "center",
  },
  {
    name: "allocated",
    labelKey: "longhorn.node.table.header.allocated",
    value: "diskAllocated",
    formatter: "ConsumptionGauge",
  },
  {
    name: "used",
    labelKey: "longhorn.node.table.header.used",
    value: "diskUsed",
    formatter: "ConsumptionGauge",
  },
  {
    name: "size",
    labelKey: "longhorn.node.table.header.size",
    value: "diskSize",
    formatter: "DiskSize",
    width: 200,
    align: "center",
  },
];

export const RECURRING_JOBS_HEADER = [
  STATE,
  NAME_COL,
  {
    name: "task",
    labelKey: "longhorn.recurringJob.table.header.task",
    value: "$.spec.task",
    sort: ["$.spec.task"],
    search: "$.spec.task",
  },
  {
    name: "cron",
    labelKey: "longhorn.recurringJob.table.header.schedule",
    value: "$.spec.cron",
    sort: ["$.spec.cron"],
    search: "$.spec.cron",
  },
  {
    name: "retain",
    labelKey: "longhorn.recurringJob.table.header.retain",
    value: "$.spec.retain",
    sort: ["$.spec.retain"],
    search: "$.spec.retain",
  },
  {
    name: "concurrency",
    labelKey: "longhorn.recurringJob.table.header.concurrency",
    value: "$.spec.concurrency",
    sort: ["$.spec.concurrency"],
    search: "$.spec.concurrency",
  },
  {
    name: "groups",
    labelKey: "longhorn.recurringJob.table.header.groups",
    value: "$.spec.groups",
    sort: ["$.spec.groups"],
    search: "$.spec.groups",
  },
  {
    name: "labels",
    labelKey: "longhorn.recurringJob.table.header.labels",
    value: "$.spec.labels",
    sort: ["$.spec.labels"],
    search: "$.spec.labels",
    formatter: "KeyValue",
  },
  AGE,
];

export const BACKUP_TARGETS_HEADER = [
  STATE,
  NAME_COL,
  {
    name: "backupTargetURL",
    labelKey: "longhorn.backupTarget.table.header.backupTargetURL",
    value: "$.spec.backupTargetURL",
    sort: ["$.spec.backupTargetURL"],
    search: "$.spec.backupTargetURL",
  },
  {
    name: "credentialSecret",
    labelKey: "longhorn.backupTarget.table.header.credentialSecret",
    value: "$.spec.credentialSecret",
    sort: ["$.spec.credentialSecret"],
    search: "$.spec.credentialSecret",
  },
  {
    name: "pollInterval",
    labelKey: "longhorn.backupTarget.table.header.pollInterval",
    value: "$.spec.pollInterval",
    sort: ["$.spec.pollInterval"],
    search: "$.spec.pollInterval",
  },

  {
    name: "available",
    labelKey: "longhorn.backupTarget.table.header.available",
    value: "$.status.available",
    sort: ["$.status.available"],
    search: "$.status.available",
  },
  {
    name: "lastSyncedAt",
    labelKey: "longhorn.backupTarget.table.header.lastSyncedAt",
    value: "$.status.lastSyncedAt",
    sort: ["$.status.lastSyncedAt"],
    search: "$.status.lastSyncedAt",
  },
];

export const SYSTEM_BACKUPS_HEADER = [
  STATE,
  NAME_COL,
  {
    name: "version",
    label: "Version",
    value: "$.status.version",
    sort: ["$.status.version"],
    search: "$.status.version",
  },
  {
    name: "state",
    label: "State",
    value: "$.status.state",
    sort: ["$.status.state"],
    search: "$.status.state",
  },

  {
    name: "lastSyncedAt",
    label: "LastSyncedAt",
    value: "$.status.lastSyncedAt",
    sort: ["$.status.lastSyncedAt"],
    search: "$.status.lastSyncedAt",
  },
];

export const ENGINE_IMAGES_HEADER = [
  STATE,
  NAME_COL,
  IMAGE_NAME,
  {
    name: "status",
    labelKey: "longhorn.engineImage.table.header.status",
    value: "$.status.state",
    sort: ["$.status.state"],
    search: "$.status.state",
  },
  {
    name: "default",
    labelKey: "longhorn.engineImage.table.header.default",
    value: "isDefault",
    formatter: "Checked",
    align: "center",
  },
  {
    name: "refCount",
    labelKey: "longhorn.engineImage.table.header.refCount",
    value: "$.status.refCount",
    sort: ["$.status.refCount"],
    search: "$.status.refCount",
    align: "center",
  },
  {
    name: "buildDate",
    labelKey: "longhorn.engineImage.table.header.buildDate",
    value: "status.buildDate",
    formatterOpts: { addSuffix: true },
    formatter: "LiveDate",
    sort: "status.buildDate",
  },
];
