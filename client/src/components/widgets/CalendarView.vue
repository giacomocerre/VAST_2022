<template>
  <div class="bg-white w-full pt-5 pb-10">
    <div class="overflow-hidden w-fit bg-gray-100 block align-middle mb-3 rounded-full">
      <options-component class="float-left" v-for="(filter, index) in filters" :value="filter" :index="index" :key="index"
        @option-selected="filterChange"
        :classes="'capitalize cursor-pointer select-none rounded-full p-1 pl-3 pr-3 text-center text-xs peer-checked:bg-blue-400 peer-checked:font-bold peer-checked:text-white'" />
    </div>
    <title-component :text="title.text" :subtitle="title.subtitle" subtitleClasses="font mb-5 text-sm"
      titleClasses="relative flex items-center text-xl dark:text-gray-600 font-bold capitalize" />
    <loading-box v-if="loading" :content="'Loading Calendar...'" />
    <div v-else-if="error">Error fetching data</div>
    <div v-else class="overflow-hidden w-fit">
      <div v-if="getData && getData.global">
        <p :style="{
          backgroundColor: setColor(getData.global.index.real, 'global'),
        }" class="w-full h-3.5 bg-[#8FBABF] rounded-full box-border border-2 border-white" @mouseenter="
  showTooltip(getData.global.index.real, getData.global.d, 'global')
  " @mouseleave="hideTooltip" @mousemove="updateTooltipPosition" @click="setDate(getData.global.d, 'global')" :class="{
    'active-item': activeItemIndex === getData.global.d,
  }"></p>
        <tool-tip-component v-if="tooltip.visible && tooltip.type === getData.global.d" :style="tooltip.style"
          title="Global" :value="tooltip.value.toFixed(2) + (filterSelected === 'saving' ? '%' : '$')
            " :tags="tags" :extra="tooltip.extra" />
        <div v-if="getData && getData.global && getData.global.years">
          <div v-for="year in getData.global.years" :key="year.d" class="float-left w-fit">
            <p :style="{ backgroundColor: setColor(year.index.real, 'year') }"
              class="w-full h-3.5 mt-0.5 rounded-full box-border border-2 border-white" @mouseenter="
                showTooltip(year.index.real, year.d.toString(), 'year')
                " @mouseleave="hideTooltip" @mousemove="updateTooltipPosition" @click="setDate(year.d, 'year')" :class="{
    'active-item': activeItemIndex === year.d,
  }"></p>
            <tool-tip-component v-if="tooltip.visible && tooltip.type === year.d.toString()" :style="tooltip.style"
              title="Year" :value="tooltip.value.toFixed(2) +
                (filterSelected === 'saving' ? '%' : '$')
                " :extra="tooltip.extra" :tags="tags" />
            <div v-for="month in year.months" :key="month.d" class="float-left w-fit m-0.5">
              <p :style="{
                backgroundColor: setColor(month.index.real, 'month'),
              }" class="w-full mt-0.5 h-2.5 rounded-full" @mouseenter="showTooltip(month.index.real, month.d, 'month')"
                @mouseleave="hideTooltip" @mousemove="updateTooltipPosition" @click="setDate(month.d, 'month')" :class="{
                  'active-item': activeItemIndex === month.d,
                }"></p>
              <tool-tip-component v-if="tooltip.visible && tooltip.type === month.d" :style="tooltip.style" title="Month"
                :value="tooltip.value.toFixed(2) +
                  (filterSelected === 'saving' ? '%' : '$')
                  " :tags="tags" :extra="tooltip.extra" />
              <p class="mt-2">{{ month.d }}</p>
              <div v-for="week in month.weeks" :key="week.d">
                <p v-for="day in week.days" :key="day.d" class="float-left overflow-hidden m-0.5 w-2.5 rounded" :style="{
                  width: '0.730rem',
                  height: '0.730rem',
                  backgroundColor: setColor(day.index.real, 'day'),
                }" :class="[
                      { 'border-gray-900 border': isWeekend(day.d) },
                      { 'active-item': activeItemIndex === day.d },]
                      " @mouseenter="showTooltip(day.index.real, day.d, 'day')
                      " @mouseleave="hideTooltip" @mousemove="updateTooltipPosition"
                  @click="setDate(day.d, 'day')">
                  <tool-tip-component 
                    v-if="tooltip.visible && tooltip.type === day.d"
                    :style="tooltip.style" title="Day"
                    :value="tooltip.value.toFixed(2) +
                      (filterSelected === 'saving' ? '%' : '$')
                      " :tags="tags" :extra="tooltip.extra"
                    measure="Average" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TitleComponent from "../atoms/TitleComponent.vue";
import ToolTipComponent from "../atoms/ToolTip.vue";
import OptionsComponent from "../OptionsComponent.vue";
import LoadingBox from "../atoms/LoadingBox.vue";
import * as d3 from "d3";

export default {
  components: {
    OptionsComponent,
    TitleComponent,
    ToolTipComponent,
    LoadingBox,
  },
  props: {
    data: { type: Object, require: true },
    inverse: {
      type: Boolean,
      default: false,
    },
    loading: { type: Boolean, default: true },
  },
  data() {
    return {
      error: null,
      fetchedData: null,
      values: {
        global: [],
        year: [],
        month: [],
        day: [],
      },
      filters: ["wage", "education", "shelter", "food", "recreation", "saving"],
      filterSelected: "wage",
      title: {
        text: "Calendar Wage Distribution",
        subtitle:
          "Calendar of the wage distribution of the participants over years, month and days",
      },
      tooltip: {
        visible: false,
        value: "No Value",
        type: "No Type",
        extra: "No Extra",
        style: { top: "0", left: "0" },
      },
      tags: ["calendar", "average", "wage"],
      activeItemIndex: "global",
    };
  },
  watch: {
    data: {
      handler: "fetchData",
      immediate: true,
    },
  },
  methods: {
    fetchData() {
      if (this.fetchData) {
        this.fetchedData = this.data;
        this.sortValues();
      } else {
        this.error = "Failed to fetch data";
      }
    },
    showTooltip(value, type, date) {
      this.tooltip = {
        visible: true,
        type,
        value,
        extra:
          this.isWeekend(type) && date === "day" ? type + " (Weekend)" : type,
      };
    },
    hideTooltip() {
      this.tooltip.visible = false;
    },
    updateTooltipPosition(event) {
      if (this.tooltip.visible) {
        const scrollY = window.scrollY || window.pageYOffset;
        const scrollX = window.scrollX || window.pageXOffset;

        this.tooltip.style = {
          top: `${event.clientY + scrollY + 5}px`,
          left: `${event.clientX + scrollX + 5}px`,
        };
      }
    },
    sortValues() {
      const { fetchedData } = this;

      if (!fetchedData || !fetchedData.global || !fetchedData.global.years) {
        return;
      }

      const flattenAndSort = (data, extractor) =>
        data
          .flatMap(extractor)
          .map((item) => item.index.real)
          .sort((a, b) => b - a);

      this.values.global = [fetchedData.global.index.real];

      this.values.year = flattenAndSort(
        fetchedData.global.years,
        (year) => year
      );

      this.values.month = flattenAndSort(
        fetchedData.global.years,
        (year) => year.months
      );

      this.values.day = flattenAndSort(fetchedData.global.years, (year) =>
        year.months.flatMap((month) => month.weeks.flatMap((week) => week.days))
      );
    },
    isWeekend(date) {
      const dayOfWeek = new Date(date).getDay();
      return dayOfWeek === 0 || dayOfWeek === 6;
    },
    setColor(index, type) {
      const { values, inverse } = this;
      const colorScale = d3
        .scaleLinear()
        .domain(d3.extent(values[type]))
        .range(inverse ? ["#FF664F", "#FFD2C4"] : ["#D6F2BB", "#456E47"])
        .nice()

      if (index === 0) {
        return "#ccc";
      }

      return inverse
        ? colorScale(index)
        : index < 0
          ? "#FF664F"
          : colorScale(index);
    },
    filterChange(selectedFilter) {
      const filterMap = {
        wage: {
          title: `${selectedFilter} expenses`,
          tags: ["calendar", "average", selectedFilter],
        },
        saving: {
          title: `${selectedFilter} expenses`,
          tags: ["calendar", "average", selectedFilter],
        },
        default: {
          title: selectedFilter,
          tags: ["calendar", "average", selectedFilter],
        },
      };

      const { title: filterTitle, tags: filterTags } =
        filterMap[selectedFilter.toLowerCase()] || filterMap.default;

      this.tags = filterTags;
      this.filterSelected = selectedFilter;

      this.title.text = `Participants ${this.filterSelected} distributions`;
      this.title.subtitle = `Calendar of the ${filterTitle} distribution of the participants over years, month and days`;

      this.$emit("changeCalendarCategory", selectedFilter.toLowerCase());
    },
    setDate(date, type) {
      this.activeItemIndex = date;
      this.$emit("changeDate", { date, type });
    },
  },
  computed: {
    getData() {
      return this.fetchedData;
    },
  },
};
</script>

<style scoped>
.tooltip {
  position: absolute;
  color: #333;
  padding: 0.5rem;
  border-radius: 4px;
  pointer-events: none;
  background: #f6f6f6;
}

.active-item {
  border: 2px solid darkorange !important;
}
</style>
