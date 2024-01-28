<template>
  <div class="relative ">
    <title-component :text="'Most ' + type + ' Path'"
      :subtitle="'View the most ' + type + ' path over all the participants paths'" subtitleClasses="font text-sm"
      note="The green dot represent the earnings and the red dot represent the expenses"
      titleClasses="relative mt-5 flex items-center text-xl dark:text-gray-600 font-bold capitalize" />
    <div class="absolute top-2 right-2">
      <span @click="changeSorting('expenses')" :class="{ 'bg-blue-400 text-white font-bold': type === 'expenses' }"
        class="py-2 px-4 inline-flex items-center mt-2 ml-4 bg-[#f6f6f6] border-l-1 pr-5 rounded-full cursor-pointer">
        <svg-icon icon="expense" class="mr-3 w-3" />
        <span class="text-xs">Expenses</span>
      </span>
      <span @click="changeSorting('frequency')" :class="{ 'bg-blue-400 text-white font-bold': type === 'frequency' }"
        class="py-2 px-4 inline-flex items-center mt-2 ml-4 bg-[#f6f6f6] border-l-1 pr-5 rounded-full cursor-pointer">
        <svg-icon icon="freq" class="mr-3 w-3" />
        <span class="text-xs">Frequencies</span>
      </span>
    </div>
  </div>
  <div class="mt-5 mb-10">
    <loading-box v-if="loading" content="Loading best path..." />
    <div v-if="!loading">
      <div class="mb-8 relative">
        <tag-component :text="type === 'expenses' && data.timestamp
            ? data.timestamp
            : activeFilter.date === 'global'
              ? 'Entire Period'
              : activeFilter.date
          " icon="date"/>
        <tag-component :text="activeFilter.participant ? activeFilter.participant : 'All Participants'" icon="participant"
         />
        <tag-component v-if="participant" :text="participant.age + ' yo'" icon="age" tooltip="User Age" />
        <tag-component v-if="participant" :text="participant.educationLevel" icon="graduate"
                  tooltip="Education Level" />
        <tag-component :text="(data.expenses_list ? data.expenses_list.reduce((acc, valore) => {
          if (valore > 0) {
            return acc + valore;
          }
          return acc;
        }, 0) : 0).toFixed(2) + '$'" icon="dollars" classes="bg-green-100" tooltip="Total Gain" />
        <tag-component :text="(data.total_expenses ? data.total_expenses * -1: 0).toFixed(2) + '$'" icon="expense" classes="bg-red-100" tooltip="All Expenses"/>
        <span @click="getPath(data.path)" :class="{ 'bg-blue-400 text-white font-bold': type === 'frequency' }"
          class="py-2 px-4 inline-flex items-center mt-2 ml-4 bg-[#f6f6f6] cursor-pointer border-l-1 pr-5 rounded-full hover:bg-blue-400 hover:text-white absolute right-0">
          <svg-icon icon="path" class="mr-3 w-3" />
          <span class="text-xs">View Path On Map</span>
        </span>
      </div>
      <div v-if="data.path">
        <div v-for="(place, index) in getPlaceFromPath(data.path)" @click="toggleExpense(index)" :key="place" class="z-10"
          :class="data.expenses_list[index] < 0 ? newLocal : 'cursor-default'">
          <div class="bg-[#f6f6f6] border-2 rounded-full p-3 text-xs float-left m-2 relative">
            <svg-icon :icon="data.type[index].type.toLowerCase()" />
            <div class="absolute w-2 h-2 left-4 bottom-11 rounded-full cursor-pointer">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-75"
                  :class="data.expenses_list[index] < 0 
                    ? 'bg-red-400'
                    : data.expenses_list[index] === 0 
                      ? 'bg-transparent' 
                        : 'bg-green-400'"></span>
                <span class="relative inline-flex rounded-full h-2 w-2" 
                  :class="data.expenses_list[index] < 0
                    ? 'bg-red-500'
                    : data.expenses_list[index] === 0 
                      ? 'bg-transparent'
                      : 'bg-green-500'"></span>
              </span>
              <div :class="{ hidden: !expenseVisible[index] }"
                class="max-w-md bg-white border border-gray-100 shadow-lg z-10 p-2 rounded w-fit text-xs relative bottom-5 left-8">
                <p class="w-full z-10 text-xs">
                  <span>
                    <tag-component :text="place" icon="hashtag"
                      classes="z-10 mb-1 max-w-md bg-[#f6f6f6] rounded-lg border border-gray-100 shadow-lg" />
                  </span>
                  <span>
                    <tag-component :text="data.type[index].type" :icon="data.type[index].type.toLowerCase()"
                      classes="z-10 mb-1 max-w-md bg-[#f6f6f6] rounded-lg border border-gray-100 shadow-lg" />
                  </span>
                  <span>
                    <tag-component :text="(data.expenses_list[index]).toFixed(2) + '$'" icon="expense"
                      tooltip="Expenses"
                      :classes="data.expenses_list[index] < 0
                        ? 'bg-red-100 z-10 mb-1 max-w-mdrounded-lg border border-red-100 shadow-lg' 
                        : data.expenses_list[index] === 0 
                          ? 'bg-slate-100 z-10 mb-1 max-w-mdrounded-lg border border-slate-100 shadow-lg' 
                          : 'bg-green-100 z-10 mb-1 max-w-mdrounded-lg border border-green-100 shadow-lg'"/>
                  </span>
                </p>
              </div>
            </div>
          </div>
          <hr v-if="index !== getPlaceFromPath(data.path).length - 1" class="connection w-10 float-left relative" />
        </div>
      </div>
      <p v-else class="w-full text-center text-xs bg-gray-100 p-5">
        <tag-component :text="'The path for User  ' +
          activeFilter.participant +
          ' on ' +
          activeFilter.date +
          ' , does not exist.'
          " icon="alert" class="text-xs" />
      </p>
    </div>
  </div>
</template>

<script>
import TitleComponent from "../atoms/TitleComponent.vue";
import SvgIcon from "../atoms/SvgIcon.vue";
import LoadingBox from "../atoms/LoadingBox.vue";
import TagComponent from "../atoms/TagComponent.vue";

export default {
  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
    loading: Boolean,
    type: { type: String, default: "frequency" },
    activeFilter: { type: Object, required: true },
    participant: Object,
  },
  components: { TitleComponent, SvgIcon, LoadingBox, TagComponent },
  data() {
    return {
      expenseVisible: [],
    };
  },
  methods: {
    getPlaceFromPath() {
      return this.data.path ? this.data.path.split("-") : [];
    },
    getPath(path) {
      this.$emit("viewPath", path);
    },
    toggleExpense(index) {
      if (!this.expenseVisible) {
        this.$set(this, "expenseVisible", []);
      }

      this.expenseVisible[index] = !this.expenseVisible[index];
    },
    changeSorting(sort) {
      this.$emit("changePathSort", sort);
    },
  },
};
</script>

<style scoped>
.connection {
  top: 25px;
  border-top: 2px dashed #ddd;
}
</style>
