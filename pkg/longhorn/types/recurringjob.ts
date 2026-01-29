export const RECURRING_JOB_TASK = {
  BACKUP: 'backup',
  SNAPSHOT: 'snapshot',
  SNAPSHOT_DELETE: 'snapshot-delete',
  SNAPSHOT_CLEANUP: 'snapshot-cleanup',
  SYSTEM_BACKUP: 'system-backup',
  FILESYSTEM_TRIM: 'filesystem-trim',
};

export const PARAM_KEYS = {
  FULL_BACKUP_INTERVAL: 'full-backup-interval',
  VOLUME_BACKUP_POLICY: 'volume-backup-policy',
};

export const VOLUME_BACKUP_POLICY = {
  IF_NOT_PRESENT: 'if-not-present',
  ALWAYS: 'always',
  DISABLED: 'disabled',
};
