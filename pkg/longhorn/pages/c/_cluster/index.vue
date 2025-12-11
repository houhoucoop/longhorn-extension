<script>
import TabTitle from "@shell/components/TabTitle";
import ResourceChart from "@longhorn/components/Dashboard/ResourceChart.vue";
import AppTooltip from "@longhorn/components/Dashboard/Tooltip.vue";
import Events from "@longhorn/components/Dashboard/Events.vue";
import LiveDate from "@shell/components/formatter/LiveDate.vue";
import { allHash } from "@shell/utils/promise";
import {
  LONGHORN_RESOURCES,
  LONGHORN_RESOURCE_IDS,
} from "../../../types/resources";
import { NODE_STATUS } from "../../../types/nodes";
import { formatGiB } from '../../../utils/formatter'

export default {
  name: "LonghornDashboard",
  components: { TabTitle, ResourceChart, AppTooltip, Events, LiveDate },

  async fetch() {
    const inStore = this.$store.getters["currentProduct"].inStore;

    const hash = {
      volumes: this.$store.dispatch(`${inStore}/findAll`, {
        type: LONGHORN_RESOURCES.VOLUMES,
      }),
      nodes: this.$store.dispatch(`${inStore}/findAll`, {
        type: LONGHORN_RESOURCES.NODES,
      }),
      serverVersion: this.$store.dispatch(`${inStore}/find`, {
        type: LONGHORN_RESOURCES.SETTINGS,
        id: LONGHORN_RESOURCE_IDS.CURRENT_LONGHORN_VERSION,
      }),
    };

    await allHash(hash);
  },

  data() {
    return {};
  },

  methods: {
    getNodeStatus(nodeData) {
      if (!nodeData || !nodeData.status || !nodeData.spec) {
        return NODE_STATUS.DOWN;
      }

      const findConditionStatus = (type) => {
        const condition = nodeData.status.conditions.find(
          (c) => c.type === type
        );
        return condition ? condition.status : null;
      };

      const readyStatus = findConditionStatus("Ready");
      if (readyStatus === "False") {
        return NODE_STATUS.DOWN;
      }

      if (nodeData.spec.allowScheduling === false) {
        return NODE_STATUS.DISABLED;
      }

      const schedulableStatus = findConditionStatus("Schedulable");
      if (schedulableStatus === "False") {
        return NODE_STATUS.UNSCHEDULABLE;
      }

      if (readyStatus === "True" && schedulableStatus === "True") {
        return NODE_STATUS.SCHEDULABLE;
      }

      return NODE_STATUS.DOWN;
    },

    hasData(chart) {
        if (!chart || !chart.datasets || chart.datasets.length === 0) {
            return false;
        }
        const total = chart.datasets[0].data.reduce(
            (sum, value) => sum + value,
            0
        );
        return total > 0.01;
    }
  },

  computed: {
    volumeChart() {
      const inStore = this.$store.getters["currentProduct"].inStore;
      const volumes = this.$store.getters[`${inStore}/all`](
        LONGHORN_RESOURCES.VOLUMES
      );

      const counts = {
        Healthy: 0,
        Degraded: 0,
        InProgress: 0,
        Faulty: 0,
        Detached: 0,
      };

      volumes.forEach((volume) => {
        const robustness = volume.status?.robustness;
        const state = volume.status?.state;

        if (state === "detached" && robustness === "faulted") {
          counts.Faulty++;
          return;
        }
        if (state === "attached" && robustness === "degraded") {
          counts.Degraded++;
          return;
        }

        if (
          (state !== "attached" && state !== "detached") ||
          (state === "attached" && robustness !== "healthy" && robustness !== "degraded")
        ) {
          counts.InProgress++;
          return;
        }

        if (state === "detached") {
          counts.Detached++;
          return;
        }

        if (state === "attached" && robustness === "healthy") {
          counts.Healthy++;
          return;
        }

        counts.Detached++;
      });

      return {
        title: "Volume",
        labels: ["Healthy", "Degraded", "In Progress", "Faulty", "Detached"],
        datasets: [
          {
            data: [
              counts.Healthy,
              counts.Degraded,
              counts.InProgress,
              counts.Faulty,
              counts.Detached,
            ],
            backgroundColor: [
              "#27AE5F",
              "#F1C40F",
              "#78C8CF",
              "#EF494A",
              "#D9DDDF",
            ],
          },
        ],
        resourceNameKey: "generic.resource",
      };
    },

    filesystemStorageChart() {
      const inStore = this.$store.getters["currentProduct"].inStore;
      const nodes = this.$store.getters[`${inStore}/all`](
        LONGHORN_RESOURCES.NODES
      );

      let totalSchedulable = 0;
      let totalReserved = 0;
      let totalUsed = 0;
      let totalDisabled = 0;

      nodes.forEach((node) => {
        const diskStatus = node.status?.diskStatus || {};
        const disksSpec = node.spec?.disks || {};

        Object.entries(diskStatus).forEach(([diskName, status]) => {
          const spec = disksSpec[diskName] || {};

          if (status.diskType === "filesystem" || spec.diskType === "filesystem") {
            const storageMaximum = status.storageMaximum || 0;
            const storageAvailable = status.storageAvailable || 0;
            const storageReserved = spec.storageReserved || 0;

            const isSchedulable = status.conditions?.find((c) => c.type === "Schedulable")?.status === "True";

            totalUsed += storageMaximum - storageAvailable;
            totalReserved += storageReserved;

            const netAvailable = storageAvailable - storageReserved;
            if (isSchedulable && netAvailable > 0) {
              totalSchedulable += netAvailable;
            }

            if (!isSchedulable && storageMaximum > 0) {
              totalDisabled += storageMaximum;
            }
          }
        });
      });

      return {
        title: "Filesystem Storage",
        labels: ["Schedulable", "Reserved", "Used", "Disabled"],
        datasets: [
          {
            data: [
              formatGiB(totalSchedulable),
              formatGiB(totalReserved),
              formatGiB(totalUsed),
              formatGiB(totalDisabled),
            ],
            backgroundColor: ["#27AE5F", "#F1C40F", "#78C8CF", "#D9DDDF"],
          },
        ],
        suffix: "Gi",
      };
    },

    blockStorageChart() {
      const inStore = this.$store.getters["currentProduct"].inStore;
      const nodes = this.$store.getters[`${inStore}/all`](
        LONGHORN_RESOURCES.NODES
      );

      let totalSchedulable = 0;
      let totalReserved = 0;
      let totalUsed = 0;
      let totalDisabled = 0;

      nodes.forEach((node) => {
        if (node.status?.diskStatus) {
          Object.values(node.status.diskStatus).forEach((diskStatus) => {
            if (diskStatus.diskType === "block") {
              const storageMaximum = diskStatus.storageMaximum || 0;
              const storageAvailable = diskStatus.storageAvailable || 0;

              const storageReserved = node.spec.disks?.[diskStatus.diskName]?.storageReserved || 0;

              const isSchedulable = diskStatus.conditions?.find((c) => c.type === "Schedulable")?.status === "True";

              totalReserved += storageReserved;
              totalUsed += storageMaximum - storageAvailable;

              const netAvailable = storageAvailable - storageReserved;

              if (isSchedulable && netAvailable > 0) {
                totalSchedulable += netAvailable;
              }

              if (!isSchedulable && storageMaximum > 0) {
                totalDisabled += storageMaximum;
              }
            }
          });
        }
      });

      return {
        title: "Block Storage",
        labels: ["Schedulable", "Reserved", "Used", "Disabled"],
        datasets: [
          {
            data: [
              formatGiB(totalSchedulable),
              formatGiB(totalReserved),
              formatGiB(totalUsed),
              formatGiB(totalDisabled),
            ],
            backgroundColor: ["#27AE5F", "#F1C40F", "#78C8CF", "#D9DDDF"],
          },
        ],
        suffix: "Gi",
      };
    },

    nodesChart() {
      const inStore = this.$store.getters["currentProduct"].inStore;
      const nodes = this.$store.getters[`${inStore}/all`](
        LONGHORN_RESOURCES.NODES
      );

      const counts = {
        [NODE_STATUS.SCHEDULABLE]: 0,
        [NODE_STATUS.UNSCHEDULABLE]: 0,
        [NODE_STATUS.DOWN]: 0,
        [NODE_STATUS.DISABLED]: 0,
      };

      nodes.forEach((node) => {
        const status = this.getNodeStatus(node);
        if (counts.hasOwnProperty(status)) {
          counts[status]++;
        } else {
          counts[NODE_STATUS.DOWN]++;
        }
      });

      return {
        title: "Node",
        labels: ["Schedulable", "Unschedulable", "Down", "Disabled"],
        datasets: [
          {
            data: [
              counts[NODE_STATUS.SCHEDULABLE],
              counts[NODE_STATUS.UNSCHEDULABLE],
              counts[NODE_STATUS.DOWN],
              counts[NODE_STATUS.DISABLED],
            ],
            backgroundColor: ["#27AE5F", "#F1C40F", "#EF494A", "#D9DDDF"],
          },
        ],
      };
    },

    charts() {
      const charts = [];
      charts.push(this.volumeChart);
      charts.push(this.filesystemStorageChart);

      if (this.hasData(this.blockStorageChart)) {
        charts.push(this.blockStorageChart);
      }

      charts.push(this.nodesChart);

      return charts;
    },

    nodeCreatedAt() {
      const inStore = this.$store.getters["currentProduct"].inStore;
      const nodes = this.$store.getters[`${inStore}/all`](
        LONGHORN_RESOURCES.NODES
      );

      if (!nodes.length) {
        return new Date().toISOString();
      }

      const timestamps = nodes.map(
        (n) => new Date(n.metadata.creationTimestamp)
      );
      const earliest = new Date(
        Math.min(...timestamps.map((d) => d.getTime()))
      );

      return earliest.toISOString();
    },

    currentVersion() {
      const inStore = this.$store.getters["currentProduct"].inStore;
      const versionObj = this.$store.getters[`${inStore}/byId`](
        LONGHORN_RESOURCES.SETTINGS,
        LONGHORN_RESOURCE_IDS.CURRENT_LONGHORN_VERSION
      );

      return versionObj?.value || "";
    },
  },
};
</script>

<template>
  <div class="outlet">
    <header>
      <div class="title">
        <h1><TabTitle>Dashboard</TabTitle></h1>
      </div>
    </header>

    <div class="glance-container">
      <div>
        <label> {{ t("longhorn.dashboard.version") }}: </label>
        <span>
          <span v-clean-tooltip="{ content: currentVersion }">
            {{ currentVersion }}
          </span>
        </span>
      </div>
      <div>
        <label> {{ t("longhorn.dashboard.created") }}: </label>
        <span>
          <LiveDate
            :value="nodeCreatedAt"
            :add-suffix="true"
            :show-tooltip="true"
          />
        </span>
      </div>
    </div>

    <div
      class="resource-gauges"
      :key="charts.length"
      :class="{
        'grid-3': charts.length === 3,
        'grid-4': charts.length >= 4,
      }"
    >
      <ResourceChart
        v-for="(chartData, index) in charts"
        :key="'group-' + index"
        :title="chartData.title"
        :chartData="chartData"
        :horizontal="charts.length < 4"
      />
    </div>
    <AppTooltip />
    <Events />
  </div>
</template>

<style lang="scss" scoped>
.glance-container {
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 10px 0;
  display: flex;

  & > * {
    margin-right: 40px;

    & SPAN {
      font-weight: bold;
    }
  }
}

.resource-gauges {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;

  @media only screen and (min-width: map-get($breakpoints, "--viewport-9")) {
    &.grid-3 {
      grid-template-columns: repeat(3, 1fr);
    }

    &.grid-4 {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media only screen and (min-width: map-get($breakpoints, "--viewport-12")) {
    &.grid-4 {
      grid-template-columns: repeat(4, 1fr);
    }
  }
}
</style>