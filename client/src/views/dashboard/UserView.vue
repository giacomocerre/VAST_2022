<template>
  <div>
    <title-component :text="title" :icon="{ icon: 'check', width: 'w-6' }" />
    <button-component v-if="date || participant" text="Reset Parameters" icon="reset" @clicked="handleReset"
      class="top-20" />
    <div>
      <div class="bg-white rounded-lg shadow mt-10 pr-5 pl-5 pb-5">
        <calendar-view :loading="loading" :data="calendar" :inverse="inverse"
          @changeCalendarCategory="handleCategoryChange" @changeDate="handleDateChange" />
      </div>
      <div class="grid grid-cols-5 gap-4">
        <div class="col-span-2 grid-row-2 bg-white rounded-lg shadow-sm mt-5 border">
          <map-view class="row-span-1 p-5 " :data="mapData" :paths="mapPath" @mapPlace="handlerPlace" />
          <div class="row-span-1 h-fit mt-3 m-5 border-t-2 pt-5 ">
            <title-component
              :text="(participant ? 'Participant ' + participant + ' - ' : '') + 'Wage Months Distribution'"
              :subtitle="(participant ? 'Participant n°' + participant : 'Participants') + ' months wages distribution'"
              subtitleClasses="font text-sm"
              titleClasses="relative flex items-center text-xl dark:text-gray-600 font-bold capitalize" />
            <loading-box v-if="pathLoading" content="Loading Wage Month Andament Data..." />
            <wage-month-andament :data="wageAndament" :participant="participant" v-if="!pathLoading" />
          </div>
        </div>
        <div class="mt-5 bg-white rounded-lg shadow col-span-3 grid grid-rows-1 pr-10 pl-10 pb-10">
          <div class="w-full h-fit block">
            <div class="w-full mt-8 rounded flex">
              <tag-component :text="date === 'global' ? 'Entire Period' : date" icon="date" />
              <tag-component v-if="participant" :text="participant" icon="participant" />
            </div>
            <participants-distribution :loading="loading" :data="distribution" :filter="categoryFilter" :inverse="inverse"
              :date="date" @changeSort="handleChangeSorting" @changeParticipant="handleChangeParticipant" />
            <div>
              <path-component class="z-10" :data="path" :type="method" :loading="pathLoading"
                :activeFilter="{ date, participant }" @viewPath="handleViewPath" @changePathSort="handleChangePathSort"
                :participant="selectedParticipant" />
              <div v-if="this.selectedParticipant" class="overflow-hidden w-full">
                <div class="flex overflow-hidden mt-5">
                  <div class="ml-2 w-1/2">
                    <h3 class="font-bold text-xs">Jobs positions:</h3>
                    <p class="float-left p-1 mr-1 mt-1 rounded bg-[#E1DA83] text-xs"
                      v-for="work in selectedParticipant.workplaces" :key="work">{{ work }}</p>
                  </div>
                  <div class="w-1/2">
                    <h3 class="font-bold text-xs"> Apartments:</h3>
                    <p class="float-left p-1 mr-1 mt-1 rounded bg-[#B4D8C7] text-xs"
                      v-for="apt in selectedParticipant.apartments" :key="apt">{{ apt }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-8 border-t-2">
            <div class="mt-5 grid grid-cols-4 gap-4 ">
              <div class="col-span-2 w-full">
                <top-list :data="top10Path" :loading="pathLoading" :type="method" :date="date" :participant="participant"
                  @placeClicked="handlerPlace" />
              </div>
              <div class="col-span-2 grid-rows-2 w-full">
                <div class="row-span-1">
                  <title-component
                    :text="(participant ? 'Participant ' + participant + ' - ' : '') + 'Expenses Chart Distribution'"
                    :subtitle="(participant ? 'Participant n°' + participant : 'Participants') + ' Food, Recreation, Education and Shelter Data Expendes'"
                    subtitleClasses="font text-sm"
                    titleClasses="relative flex items-center text-xl dark:text-gray-600 font-bold capitalize" />
                  <loading-box v-if="pathLoading" content="Loading Expenses Data..." />
                  <calendar-info v-if="!pathLoading" :data="calendarInfo" :date="date" :participant="participant" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MapView from "@/components/widgets/MapView.vue";
import LoadingBox from "@/components/atoms/LoadingBox.vue";
import TitleComponent from "../../components/atoms/TitleComponent.vue";
import { fetchMap } from "@/api/Buildings.js";
import {
  fetchCalendar,
  fetchCalendarInfo,
  fetchParticipantsDistributions,
  fetchPaths,
  fetchWageAndament,
} from "@/api/Participants";
import { fetchParticipant } from "@/api/Demography"
import { fetchPlace } from "@/api/Buildings";
import CalendarView from "@/components/widgets/CalendarView.vue";
import ParticipantsDistribution from "@/components/widgets/ParticipantsDistribution.vue";
import PathComponent from "@/components/widgets/PathComponent.vue";
import ButtonComponent from "@/components/atoms/ButtonComponent.vue";
import TagComponent from "@/components/atoms/TagComponent.vue";
import TopList from "@/components/widgets/TopList.vue";
import CalendarInfo from "@/components/widgets/CalendarInfo.vue";
import WageMonthAndament from "@/components/widgets/WageMonthAndament.vue";

export default {
  props: {
    title: {
      type: String,
      required: true,
    },
  },

  components: {
    TitleComponent,
    LoadingBox,
    MapView,
    CalendarView,
    ParticipantsDistribution,
    PathComponent,
    ButtonComponent,
    TagComponent,
    TopList,
    CalendarInfo,
    WageMonthAndament,
  },
  data() {
    return {
      mapData: [],
      calendar: {},
      distribution: [],
      wageAndament: [],
      mapPath: [],
      path: {},
      top10Path: [],
      selectedPlace: null,
      calendarInfo: {},
      inverse: false,
      categoryFilter: "wage",
      method: "frequency",
      date: "global",
      dateType: 'global',
      sort: "participant",
      participant: null,
      loading: true,
      pathLoading: true,
      place: null,
      selectedParticipant: null
    };
  },
  created() {
    this.fetchData();
  },
  watch: {
    categoryFilter: "fetchData",
    date: "fetchParticipantsData",
    dateType: "fetchParticipantsData",
    sort: "fetchParticipantsData",
    method: "fetchParticipantsData",
    participant: "fetchParticipantsData",
    place: 'fetchPlace'
  },
  methods: {
    async fetchData() {
      try {
        this.mapPath = [];
        this.loading = true;
        this.pathLoading = true;
        this.selectedPlace = null

        const [mapData, calendar, distribution, paths, info, andament] = await Promise.all([
          fetchMap(),
          fetchCalendar(this.categoryFilter),
          fetchParticipantsDistributions(this.categoryFilter, this.date, this.sort),
          fetchPaths(this.method, this.date, this.participant),
          fetchCalendarInfo(this.dateType, this.date, this.participant),
          fetchWageAndament(this.participant)
        ]);

        this.mapData = mapData;
        this.calendar = calendar;
        this.distribution = distribution;
        this.path = await this.getPathInfo(paths.path);
        this.top10Path = await this.getTopInfo(paths.top);
        this.calendarInfo = info;
        this.wageAndament = andament

        this.loading = false;
        this.pathLoading = false;
      } catch (error) {
        console.error("Error fetching data:", error);
        this.loading = false;
        this.pathLoading = false;
      }
    },

    async fetchParticipantsData() {
      try {
        this.pathLoading = true;
        this.mapPath = [];
        this.selectedPlace = null;
        const [mapData, distribution, paths, info, andament, participant] = await Promise.all([
          fetchMap(),
          fetchParticipantsDistributions(this.categoryFilter, this.date, this.sort),
          fetchPaths(this.method, this.date, this.participant),
          fetchCalendarInfo(this.dateType, this.date, this.participant),
          fetchWageAndament(this.participant),
          fetchParticipant(this.participant)
        ]);

        this.mapData = mapData;
        this.distribution = distribution;
        this.path = await this.getPathInfo(paths.path);
        this.top10Path = await this.getTopInfo(paths.top);
        this.calendarInfo = info;
        this.wageAndament = andament
        this.selectedParticipant = participant

        this.loading = false;
        this.pathLoading = false;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },

    async getPathInfo(data) {

      if (data.path) {
        const placesSplitted = data.path.split("-");

        const result = await Promise.all(
          placesSplitted.map(async (placeId) => {
            return await this.getPlace(placeId);
          })
        );
        data.type = result;
      } else {
        return {}
      }
      return data;
    },

    async getTopInfo(data) {
      await Promise.all(
        data.map(async (p) => {
          try {
            const placeData = await this.getPlace(p.place);
            p.type = placeData.type;
          } catch (error) {
            console.error(`Error fetching place data for ${p.place}:`, error);
          }
        })
      );
      return data
    },

    async fetchPlace() {
      this.selectedPlace = await this.getPlace(this.place);
    },


    async getPlace(id) {
      return await fetchPlace(id);
    },

    handleCategoryChange(category) {
      category !== "wage" && category !== "saving"
        ? (this.inverse = true)
        : (this.inverse = false);
      this.categoryFilter = category;
    },

    handleDateChange(date) {
      this.date = date.date;
      this.dateType = date.type
    },
    handleChangeSorting(sort) {
      this.sort = sort;
    },
    handleChangeParticipant(participant) {
      this.participant = participant;
    },
    handleViewPath(path) {
      this.mapPath = [path];
    },
    handleChangePathSort(sort) {
      this.method = sort;
    },
    handleReset() {
      this.categoryFilter = "wage";
      this.method = "frequency";
      this.date = "global";
      this.sort = "participant";
      this.participant = null;
      this.loading = true;
      this.pathLoading = true;
      this.top10 = [];
      this.mapPath = [];
    },

    handlerPlace(place) {
      const point = place + '-' + place
      this.mapPath = [point]
      this.place = place;
    }
  },
};
</script>
<style scoped></style>
