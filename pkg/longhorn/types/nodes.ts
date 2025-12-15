export const NODE_STATUS = {
  DOWN: 'Down',
  DISABLED: 'Disabled',
  UNSCHEDULABLE: 'Unschedulable',
  SCHEDULABLE: 'Schedulable',
} as const;
export interface LonghornNode {
  metadata?: {
    name: string;
    creationTimestamp?: string;
  };
  spec?: {
    allowScheduling?: boolean;
    disks?: Record<string, DiskSpec>;
  };
  status?: NodeStatusDetail;
}

export interface NodeStatusDetail {
  conditions?: Array<{ type: string; status: string }>;
  diskStatus?: Record<string, DiskStatus>;
  state?: string;
  robustness?: string;
}

export interface DiskSpec {
  storageReserved?: number;
  diskType?: "filesystem" | "block";
}

export interface DiskStatus {
  storageMaximum?: number;
  storageAvailable?: number;
  diskType?: "filesystem" | "block";
  conditions?: Array<{ type: string; status: string }>;
}
