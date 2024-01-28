<template>
    <title-component :text="getTitle(current).title" :subtitle="getTitle(current).subtitle" :note="getTitle(current).note"
        subtitleClasses="font text-sm"
        titleClasses="relative mt-5 flex items-center text-xl dark:text-gray-600 font-bold capitalize" />
    <div class="flex items-center gap-10">
        <search-input placeholder="Search Participant Id" type="number" max="1010" min="0" @search="showParticipant" />
        <search-input placeholder="Search Place Id" type="number" max="3000" min="0" @search="showPlace" />
    </div>
    <loading-box v-if="loading" content="Loading Places Period Activity..." />
    <div v-if="!loading" class="py-5 px-14 w-full">
        <div v-for="place in  data " :key="place.placeId">
            <div v-if="shouldShowPlace(place.placeId)"
                class="w-full h-10 border-l-[4px] flex items-center p-6 text-xs relative">
                <span class="absolute left-[-55px]">#{{ place.placeId }}</span>
                <span class="border p-1.5 rounded-full border-black bg-white relative right-10">
                    <svg-icon :icon="place.type.toLowerCase()" width="w-4" />
                </span>

                <div class="h-10 relative right-5 flex items-center">
                    <div v-for="month in place.monthlyIndexes" :key="'a' + place.placeId + month"
                        class="w-full relative cursor-pointer"
                        @click="selectPlaceMonth(place.type.toLowerCase(), place.placeId, month.month)">
                        <div>
                            <p class="absolute">
                                <span v-if="month.percentageChangeIndex < 0"
                                    class="relative left-5 bottom-2 flex h-1.5 w-1.5">
                                    <span
                                        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-85"></span>
                                    <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                </span>
                            </p>
                            <p class="absolute">
                                <span v-if="month.percentageChangeIndex > 0"
                                    class="relative left-5 bottom-2 flex h-1.5 w-1.5">
                                    <span
                                        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-85"></span>
                                    <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                </span>
                            </p>
                            <p v-if="month.percentageChangeIndex < 0"
                                class="float-left absolute bottom-3.5 left-5 w-1.5 h-1.5 animate-ping mr-0.5 bg-red-100 rounded-full"
                                @mouseenter="showTooltip(month.percentageChangeIndex, place.placeId + month.month, getTags(place, 'percentage'), getMeasure(place, 'percentage'), '%', 'shadow-red-500')"
                                @mouseleave="hideTooltip" :style="{
                                    backgroundColor: setColor(month.percentageChangeIndex),
                                }">
                            </p>

                            <p v-if="month.percentageChangeIndex > 0"
                                class="float-left absolute bottom-3.5 left-5 w-1.5 h-1.5 animate-ping mr-0.5 bg-green-100 rounded-full"
                                @mouseenter="showTooltip(month.percentageChangeIndex, place.placeId + month.month, getTags(place, 'percentage'), getMeasure(place, 'percentage'), '%', 'shadow-green-500')"
                                @mouseleave="hideTooltip" :style="{
                                    backgroundColor: setColor(month.percentageChangeIndex),
                                }">
                            </p>
                            <p class="float-left w-12 h-3 mr-0.5 border border-gray-400 bg-red-100 rounded-full"
                                @mouseenter="showTooltip(month.total, place.placeId + month.month, getTags(place), getMeasure(place), '$')"
                                @mouseleave="hideTooltip" :style="{
                                    backgroundColor: shouldShowMonth(month) ? setColor(month.total) : 'transparent',
                                }">
                            </p>
                            <div class="absolute w-72">
                                <tool-tip-component v-if="tooltip.visible && tooltip.type === place.placeId + month.month"
                                    :title="place.placeId + ' in ' + month.month"
                                    :value="tooltip.value.toFixed(2) + tooltip.unit" :tags="tags" :extra="tooltip.extra"
                                    class="left-5 top-2 shadow-md" :class="tooltip.shadow" :measure="tooltip.measure" />
                            </div>
                        </div>
                    </div>
                    <tag-component :text="'~' + place.monthlyIndexes.reduce((accumulator, currentValue) => {
                        return accumulator + currentValue.total;
                    }, 0).toFixed(0) + '$'" icon="dollars" classes="ml-2 bg-slate-100 text-md font-bold" />
                    <div class="relative bottom-1">
                        <label for="disabled-range" class="block mb-2 text-sm font-medium text-gray-900">{{ place.type ===
                            'Employer' ? 'Turnover' : 'Affluence' }}: <highlight-part :text="place.monthlyIndexes.reduce((accumulator, currentValue) => {
                                return accumulator + currentValue.percentageChangeIndex;
                            }, 0).toFixed(0) + '%'" 
                            :class="place.monthlyIndexes.reduce((accumulator, currentValue) => {
                                return accumulator + currentValue.percentageChangeIndex;
                            }, 0) < 0 ? 'bg-red-100' : 'bg-blue-100'"/>
                            </label>
                        <input type="range" min="0" max="100" :value="Math.abs(parseInt(place.monthlyIndexes.reduce((accumulator, currentValue) => {
                            return accumulator + currentValue.percentageChangeIndex;
                        }, 0)).toFixed(0))" step="1" id="range" disabled
                        :class="place.monthlyIndexes.reduce((accumulator, currentValue) => {
                            return accumulator + currentValue.percentageChangeIndex;
                        }, 0) < 0 ? 'red-range': 'blue-range'" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import LoadingBox from '../atoms/LoadingBox.vue';
import SvgIcon from '../atoms/SvgIcon.vue';
import TitleComponent from '../atoms/TitleComponent.vue';
import ToolTipComponent from '../atoms/ToolTip.vue';
import SearchInput from '../atoms/SearchInput.vue';
import TagComponent from '../atoms/TagComponent.vue';
import HighlightPart from '../atoms/HighlightPart.vue';

import * as d3 from 'd3';

export default {
    components: { LoadingBox, SvgIcon, ToolTipComponent, TitleComponent, SearchInput, TagComponent, HighlightPart },
    props: {
        data: {
            type: Array,
            required: true
        },
        loading: {
            type: Boolean,
            default: true
        },
        current: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            tags: [],
            tooltip: {
                visible: false,
                value: "No Value",
                type: "No Type",
                extra: "No Extra",
                style: { top: "-10px", left: "-10px" },
                measure: "",
                unit: "",
                shadow: ""
            },
            participant: null,
            place: null,
            placeShow: true

        };
    },
    computed: {
        colorScale() {
            const totalList = this.data.map(item => item.monthlyIndexes[0].total)
            return d3
                .scaleLinear()
                .domain(d3.extent(totalList))
                .range(["#D6F2BB", "#044D29"])
                .nice()
        }
    },
    methods: {
        showTooltip(value, type, tags, measure, unit, shadow) {
            this.tags = tags;
            this.tooltip = {
                visible: true,
                type,
                value,
                measure: measure,
                unit,
                shadow
            };
        },
        getTags(place, index = undefined) {
            if (place.type === 'Employer') {
                return index === 'percentage' ? [place.placeId, place.type, 'Turnover Rate'] : [place.placeId, place.type, 'Month Salaries']
            } else {
                return index === 'percentage' ? [place.placeId, place.type, 'Affluence Rate'] : [place.placeId, place.type, 'Month Earnings']
            }
        },
        getMeasure(place, index = undefined) {
            if (place.type === 'Employer') {
                return index === 'percentage' ? 'Turnover Rate' : 'Month Salaries'
            } else {
                return index === 'percentage' ? 'Affluence Rate' : 'Month Earnings'
            }
        },
        hideTooltip() {
            this.tooltip.visible = false;
        },
        getTitle(view) {
            switch (view) {
                case 'activities':
                    return { title: "All Pubs and Restaurant Earnings Andament", subtitle: "Month Earnings Andament of all Pubs and Restaurants Places.", note: "The red dots indicate months with a decrease in attendance compared to the previous month" }
                case 'pub':
                    return { title: "Pubs Earnings Andament", subtitle: "Month Earnings Andament of all Pubs Places.", note: "The red dots indicate months with a decrease in attendance compared to the previous month" }
                case 'restaurant':
                    return { title: "Restaurants Earnings Andament", subtitle: "Month Earnings Andament of all Restaurant Places.", note: "The red dots indicate months with a decrease in attendance compared to the previous month" }
                case 'employer':
                    return { title: "Employers Salaries Andament", subtitle: "Month Salaries Andament of all Employers Places.", note: "The red dots indicate months with significant employee turnover compared to the previous month." }
            }
        },
        setColor(index) {
            if (index === 0) {
                return "#ccc";
            }

            return index < 0 ? "#FF664F" : this.colorScale(index);
        },
        shouldShowPlace(place) {
            if (!this.place) {
                return true
            } else {
                console.log(place, this.place)
                return place === this.place
            }
        },
        shouldShowMonth(month) {
            if (!this.participant) {
                return true;
            } else {
                const show = month.current.includes(this.participant)
                this.placeShow = show;
                return show
            }
        },
        selectPlaceMonth(type, place, month) {
            this.$emit('selected-place-data', { type, place, month })
        },
        showParticipant(participant) {
            this.participant = participant.toString();
        },
        showPlace(place) {
            this.place = place;
        }
    },
};
</script>
<style scoped>
input::-webkit-slider-runnable-track {
  background-color: #fff;
  border: 1px solid #ccc;
  height: 8px;
  border-radius: 100px;
} 
input::-webkit-slider-thumb {
  position: relative;
  bottom:5px;
  -webkit-appearance: none;
  background-color: blue;
  border-radius: 100px;
}
input.blue-range::-webkit-slider-thumb {
  box-shadow: 0px 0 0 0px rgb(59 130 246), inset 0 0 0 40px rgb(59 130 246), 0px 0 0 0px #00f18f, inset 0 0 0 40px rgb(59 130 246);
}
input.red-range::-webkit-slider-thumb {
  box-shadow: 0px 0 0 0px rgb(239,68,68), inset 0 0 0 40px rgb(239,68,68), 0px 0 0 0px #00f18f, inset 0 0 0 40px rgb(239,68,68);

}
</style>