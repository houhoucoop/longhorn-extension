<script>
import TabTitle from "@shell/components/TabTitle";
import ResourceChart from "@longhorn/components/Dashboard/ResourceChart.vue";
import AppTooltip from "@longhorn/components/Dashboard/Tooltip.vue";
import Events from "@longhorn/components/Dashboard/Events.vue";
import { allHash } from "@shell/utils/promise";
import {
  LONGHORN_RESOURCES,
  LONGHORN_RESOURCE_IDS,
} from "../../../types/resources";

export default {
  name: "LonghornDashboard",
  components: { TabTitle, ResourceChart, AppTooltip, Events },

   async fetch() {
    const inStore = this.$store.getters["currentProduct"].inStore;

    const hash = {
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
    return {
      volumeChart1: {
        title: "Volume",
        labels: ["Healthy", "Degraded", "In Progress", "Faulty", "Detached"],
        datasets: [
          {
            data: [1, 2, 0, 0, 1],
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
      },
      storageChart1: {
        title: "Storage",
        labels: ["Schedulable", "Reserved", "Used", "Disabled"],
        datasets: [
          {
            data: [8.31, 8.98, 12.6, 0],
            backgroundColor: ["#27AE5F", "#F1C40F", "#78C8CF", "#D9DDDF"],
          },
        ],
        suffix: "Gi",
      },
      nodeChart1: {
        title: "Node",
        labels: ["Schedulable", "Unschedulable", "Down", "Disabled"],
        datasets: [
          {
            data: [1, 0, 0, 0],
            backgroundColor: ["#27AE5F", "#F1C40F", "#EF494A", "#D9DDDF"],
          },
        ],
      },
      volumeChart2: {
        title: "Volume",
        labels: ["Healthy", "Degraded", "In Progress", "Faulty", "Detached"],
        datasets: [
          {
            data: [1, 2, 0, 0, 1],
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
      },
      storageChart2: {
        title: "Overall Storage",
        labels: ["Schedulable", "Reserved", "Used", "Disabled"],
        datasets: [
          {
            data: [8.31, 8.98, 12.6, 0],
            backgroundColor: ["#27AE5F", "#F1C40F", "#78C8CF", "#D9DDDF"],
          },
        ],
        suffix: "Gi",
      },
      nodeChart2: {
        title: "Block Storage",
        labels: ["Schedulable", "Reserved", "Used", "Disabled"],
        datasets: [
          {
            data: [2.98, 1, 0, 0],
            backgroundColor: ["#27AE5F", "#F1C40F", "#78C8CF", "#D9DDDF"],
          },
        ],
        suffix: "Gi",
      },
      nodesChart2: {
        title: "Node",
        labels: ["Schedulable", "Unschedulable", "Down", "Disabled"],
        datasets: [
          {
            data: [1, 0, 0, 0],
            backgroundColor: ["#27AE5F", "#F1C40F", "#EF494A", "#D9DDDF"],
          },
        ],
      },
      currentVersion: "",
    };
  },

  computed: {
    chartsGroup1() {
      return [this.volumeChart1, this.storageChart1, this.nodeChart1];
    },
    chartsGroup2() {
      return [
        this.volumeChart2,
        this.storageChart2,
        this.nodeChart2,
        this.nodesChart2,
      ];
    },

    nodeCreatedAt() {
      const inStore = this.$store.getters["currentProduct"].inStore;
      const nodes = this.$store.getters[`${inStore}/all`](LONGHORN_RESOURCES.NODES);

      if (!nodes.length) {
        return new Date().toISOString();
      }

      const timestamps = nodes.map((n) => new Date(n.metadata.creationTimestamp));
      const earliest = new Date(Math.min(...timestamps.map((d) => d.getTime())));

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

    <div class="resource-gauges grid-3">
      <ResourceChart
        v-for="(chartData, index) in chartsGroup1"
        :key="'group1-' + index"
        :title="chartData.title"
        :chartData="chartData"
        :horizontal="chartsGroup1.length < 4"
      />
    </div>

    <div class="resource-gauges grid-4">
      <ResourceChart
        v-for="(chartData, index) in chartsGroup2"
        :key="'group2-' + index"
        :title="chartData.title"
        :chartData="chartData"
        :horizontal="chartsGroup2.length < 4"
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
