<template>
    <div class="mt-3 mb-5">
        <span @click="changeFilter('total')" :class="{ 'bg-blue-400 text-white font-bold': filter === 'total' }"
            class="py-2 px-4 inline-flex items-center mt-2 bg-[#f6f6f6] border-l-1 pr-5 rounded-full cursor-pointer">
            <svg-icon icon="dollars" class="mr-3 w-3" />
            <span class="text-xs">Salaries/Earnings</span>
        </span>
        <span @click="changeFilter('percentageChangeIndex')"
            :class="{ 'bg-blue-400 text-white font-bold': filter === 'percentageChangeIndex' }"
            class="py-2 px-4 inline-flex items-center mt-2 ml-4 bg-[#f6f6f6] border-l-1 pr-5 rounded-full cursor-pointer">
            <svg-icon icon="turnover" class="mr-3 w-3" />
            <span class="text-xs">Turnover/Affluance</span>
        </span>
    </div>
    <loading-box v-if="loading" content="Loading Period Overall Information..." />
    <div v-if="!loading">
        <div v-for="(place, i) in data" :key="i" class="bg-[#fff] p-3 mt-3 rounded-md border shadow-md">
            <!-- <h3 class="text-md font-bold">Overall <highlight-part :text="place.type + 's'" /> Info</h3> -->
            <title-component :text="place.type + ' Insights Overview'"
                :subtitle="'Explore total revenue trends, identify the top visitor, and discover the most visited ' + place.type"
                subtitleClasses="font text-sm mb-5"
                titleClasses="relative mt-2 flex items-center text-xl dark:text-gray-600 font-bold capitalize " />
            <tag-component :icon="place.type.toLowerCase()" :text="place.numbers" :tooltip="'All ' + place.type + 's'" />
            <tag-component icon="turnover" :text="place.percentageChangeIndex.toFixed(2) + '%'"
                :tooltip="getTootlip(place.type, 'percentage')" classes="bg-red-100 border border-red-200 shadow my-3" />
            <tag-component icon="dollars" :text="place.total.toFixed(2) + '$'" :tooltip="getTootlip(place.type, 'total')" />
            <period-places-line-chart :data="place.monthlyIndexes" :filter="filter" />
            <div>
                <widget-info 
                    title="Information About Participants of"
                    :data="[place.bestParticipant, place.worstParticipant]"
                    :id="[place.bestParticipant.participantId, place.worstParticipant.participantId]"
                    :type="place.type"
                    :numbers="place.numbers"
                    icon="user"
                    idType="User"
                    :where="` ${place.type.toLowerCase()}s over `"
                    :dataExplain="[`Best ${place.type}s Visitor`,`Worst ${place.type}s Visitor` ]"
                    :tooltips="[`Visited ${place.type}s of ${place.bestParticipant.participantId}`, `Visited ${place.type}s of ${place.worstParticipant.participantId}`]" />
            </div>
            <div>
                <widget-info 
                    title="Information About"
                    :data="[place.bestPlace, place.worstPlace]"
                    :id="[place.bestPlace.placeId, place.worstPlace.placeId]"
                    :type="place.type"
                    :numbers="1011"
                    :icon="place.type.toLowerCase()"
                    idType="Place"
                    where=" users over "
                    :dataExplain="[`Most Visited ${place.type}`,`Less Visited ${place.type}` ]"
                    :tooltips="['Total Number of unique visitors', 'Total Number of unique visitors']" />
            </div>
        </div>
    </div>
</template>
<script>
import PeriodPlacesLineChart from './PeriodPlacesLineChart.vue';
import TagComponent from '../atoms/TagComponent.vue';
import SvgIcon from '../atoms/SvgIcon.vue';
import TitleComponent from '../atoms/TitleComponent.vue';
import LoadingBox from '../atoms/LoadingBox.vue';
import WidgetInfo from './WidgetInfo.vue';
export default {
    components: { PeriodPlacesLineChart, TagComponent, SvgIcon, TitleComponent, LoadingBox, WidgetInfo },
    props: {
        data: {
            type: Array,
            required: true
        },
        loading: {
            type: Boolean,
            default: true
        },
    },
    data() {
        return {
            filter: 'total',
        }
    },
    methods: {
        getTootlip(place, type) {
            switch (place) {
                case ('Employer'):
                    return type === 'total' ? 'Average Salaries' : 'Average Turnover'
                default:
                    return type === 'total' ? 'Average Earning' : 'Average Affluence'
            }
        },
        changeFilter(filter) {
            this.filter = filter
        },
    }
}
</script>