<template>
    <loading-box v-if="loading" content="Loading Information About Selected Place..." />
    <div v-if="!loading">
        <place-info :data="data.dataPlace" />
        <div v-if="data.history[0]" class="p-2">
            <h4 @click="toggleContent" class="font-bold mt-5 mb-5 text-[#333] text-md border-b pb-2 flex items-center relative">Information About the Place <svg-icon :icon=" showContent ? 'up': 'down'" class="absolute right-10" width="w-6"/></h4>
            <div v-if="showContent">
                <div class="text-xs">
                    <tag-component icon="date" :text="selectedPlace.month" />
                    <tag-component icon="turnover"
                        :text="data.history[0].monthlyIndexes[0].percentageChangeIndex.toFixed(2) + '%'" :classes="data.history[0].monthlyIndexes[0].percentageChangeIndex > 0
                            ? 'bg-green-100'
                            : data.history[0].monthlyIndexes[0].percentageChangeIndex === 0
                                ? 'bg-slate-100'
                                : 'bg-red-100'" tooltip="Turnover Rate" />
                    <tag-component icon="dollars" :text="data.history[0].monthlyIndexes[0].total.toFixed(2) + '$'"
                        :tooltip="selectedPlace.type === 'employer' ? selectedPlace.month + ' Employees Salaries' : selectedPlace.month + ' Affluence Earnings'" />
                </div>
                <div class="w-full bg-white mt-5 p-4 border shadow-md rounded-md">
                    <current-previous-exited :data="data.history[0].monthlyIndexes[0].current"
                        :title="selectedPlace.type === 'employer' ? 'Current Employees' : 'Current Clients'" />
                </div>
                <div class="w-full bg-white mt-5 p-4 border shadow-md rounded-md">
                    <current-previous-exited :data="data.history[0].monthlyIndexes[0].newest"
                        :title="selectedPlace.type === 'employer' ? 'Newest Employees' : 'Newest Clients'" />
                </div>
                <div class="w-full bg-white mt-5 p-4 border shadow-md rounded-md">
                    <current-previous-exited :data="data.history[0].monthlyIndexes[0].previous"
                        :title="selectedPlace.type === 'employer' ? 'Previous Employees' : ' Previous Clients'" />
                </div>
                <div class="w-full bg-white mt-5 p-4 border shadow-md rounded-md">
                    <current-previous-exited :data="data.history[0].monthlyIndexes[0].exited"
                        :title="selectedPlace.type === 'employer' ? 'Exited Employees' : 'Exited Clients'" />
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import TagComponent from '../atoms/TagComponent.vue';
import LoadingBox from '../atoms/LoadingBox.vue';
import PlaceInfo from './PlaceInfo.vue';
import CurrentPreviousExited from './CurrentPreviousExited.vue';
import SvgIcon from '../atoms/SvgIcon.vue';
export default {
    components: { TagComponent, LoadingBox, PlaceInfo, CurrentPreviousExited, SvgIcon },
    props: {
        data: {
            type: Object,
            required: true
        },
        selectedPlace: Object,
        loading: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            showContent: false,
        }
    },
    methods: {
        toggleContent() {
            this.showContent = !this.showContent
        }
    }

}
</script>
