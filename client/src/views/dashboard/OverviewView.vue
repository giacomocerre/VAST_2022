<template>
  <div>
    <title-component :text="title" :icon="{ icon: 'check', width: 'w-6' }" />
    <div
      class="mt-10 w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
    >
      <stats-component
        v-for="(stat, index) in DemoStats"
        :key="index"
        :title="stat.title"
        :description="stat.description"
        :value="stat.value"
        :unit="stat.unit"
        :trend="stat.trend || null"
      />
    </div>
    <main class="grid w-full mt-5 p-2">
      <div
        class="grid w-[20rem] grid-cols-4 gap-1 rounded-xl bg-gray-200 text-xs"
      >
        <options-component
          v-for="(filter, index) in filters"
          :value="filter"
          :index="index"
          :key="index"
          @option-selected="filterChange"
        />
      </div>
      <button-component
        text="Reset Parameters"
        icon="reset"
        @clicked="resetChart"
      />
    </main>
    <div
      class="mt-5 w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-2"
    >
      <stats-component
        v-for="(stat, index) in TrendStats"
        :key="index"
        :title="stat.title"
        :description="stat.description"
        :value="stat.value"
        :unit="stat.unit"
        :trend="stat.trend || null"
      />
    </div>
    <div class="grid grid-cols-4 gap-3">
      <lorenz-curve
        class="mt-10 bg-white rounded-lg shadow"
        v-if="LorenzCurve"
        :data="LorenzCurve"
        :filter="filterSelected"
      />
      <stable-wage-chart
        class="mt-10 bg-white rounded-lg shadow col-span-3"
        v-if="WageStability"
        :data="WageStability"
        :range="ageRange"
        @brushSelected="changeRange"
        @resetData="resetChart"
      />
    </div>
  </div>
</template>

<script>
import StatsComponent from "../../components/widgets/StatsComponent.vue";
import TitleComponent from "../../components/atoms/TitleComponent.vue";
import { fetchAverages, fetchParticipants } from "../../api/Demography.js";
import {
  fetchGlobalVariables,
  fetchTrends,
  fetchLorenzCurve,
  fetchDistribution,
} from "../../api/Economy.js";
import OptionsComponent from "@/components/OptionsComponent.vue";
import LorenzCurve from "@/components/widgets/LorenzCurve.vue";
import StableWageChart from "@/components/widgets/StableWageChart.vue";
import ButtonComponent from "@/components/atoms/ButtonComponent.vue";

export default {
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  components: {
    StatsComponent,
    TitleComponent,
    OptionsComponent,
    LorenzCurve,
    StableWageChart,
    ButtonComponent,
  },
  data() {
    return {
      DemoStats: [],
      TrendStats: [],
      LorenzCurve: [],
      WageStability: false,
      filterSelected: "day",
      ageRange: "18-60",
      filters: ["day", "week", "month", "year"],
    };
  },
  created() {
    this.fetchData();
    this.fetchDynamicsData();
  },
  watch: {
    filterSelected: {
      handler: "fetchDynamicsData",
      immediate: true,
    },
    ageRange: {
      handler: "fetchDynamicsData",
      immediate: true,
    },
  },
  methods: {
    async fetchData() {
      this.DemoStats = [
        await fetchParticipants(),
        await fetchAverages("age"),
        await fetchAverages("education"),
        await fetchGlobalVariables("stable"),
      ];
    },
    async fetchDynamicsData() {
      this.TrendStats = [
        await fetchTrends(this.filterSelected, "averageTrend"),
        await fetchTrends(this.filterSelected, "expensesTrend"),
      ];

      this.LorenzCurve = await fetchLorenzCurve(this.filterSelected);
      this.WageStability = await fetchDistribution(
        this.filterSelected,
        this.ageRange
      );
    },
    changeRange(range) {
      this.ageRange = range;
    },
    resetChart() {
      this.ageRange = "18-60";
    },
    filterChange(filter) {
      this.filterSelected = filter;
    },
  },
};
</script>
