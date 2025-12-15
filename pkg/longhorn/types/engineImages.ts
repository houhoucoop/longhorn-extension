export interface EngineImage {
  spec?: {
    image?: string;
  };
  status?: {
    state?: string;
    refCount?: number;
    buildDate?: string;
    cliAPIVersion?: string;
    controllerAPIVersion?: string;
    noRefSince?: string;
    nodeDeploymentMap?: Record<string, boolean>;
  };
  isDefault?: boolean;
}
