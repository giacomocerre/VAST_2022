<template>
    <div>
        <title-component :text="getExplain('title', type)" :subtitle="getExplain('sub', type)"
            subtitleClasses="font text-sm"
            titleClasses="relative flex items-center text-xl dark:text-gray-600 font-bold capitalize" />
        <loading-box v-if="loading" content="Loading Top 10 places..." />
        <div v-if="!loading" class="mt-5">
            <div v-if="data.length > 0" class="p-6 max-w-md bg-white rounded-lg border border-gray-100 shadow-lg">
                <div class="flow-root">
                    <ul role="list" class="divide-y divide-gray-200">
                        <li v-for="(place, index) in data" :key="place.place" @click="setPlace(place.place)"
                            class="cursor-pointer py-2 hover:bg-blue-400 hover:scale-125  hover:transform hover:transition hover:duration-y hover:px-2 hover:text-white hover:rounded hover:box-content">
                            <div class="flex items-center space-x-4">
                                <div>
                                    <p>{{ index + 1 }}°</p>
                                </div>
                                <div class="flex-shrink-0">
                                    <svg-icon :icon="place.type.toLowerCase()" />
                                </div>
                                <div class="flex-1 min-w-0 ">
                                    <p class="text-sm font-bold truncat">
                                        {{ place.type }}
                                    </p>
                                    <p class="text-sm text-gray-">
                                        <svg-icon icon="hashtag" class="float-left relative top-1.5" width="w-2" />{{
                                            place.place }}
                                    </p>
                                </div>
                                <div class="flex items-center">

                                </div>
                                <div class="inline-flex items-center text-base font-semibold text-gray-900">
                                    <span class="p-2 ml-2 rounded text-xs shadow-md" :class="getColor(type, place.value)">{{
                                        getIndicator(type, place.value) }}: <span class="ml-1 text-base font-bold">
                                            {{ Math.abs(place.value).toFixed(0) }}</span></span>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <p v-else class="w-full text-center text-xs bg-gray-100 p-5">
                <tag-component 
                    text="There are not any places in the Top 10 List"
                    icon="alert" classes="text-xs bg-slate-100" />
            </p>
        </div>
    </div>
</template>
<script>
import LoadingBox from '../atoms/LoadingBox.vue';
import SvgIcon from '../atoms/SvgIcon.vue';
import TitleComponent from '../atoms/TitleComponent.vue';
import TagComponent from '../atoms/TagComponent.vue';
export default {
    components: { LoadingBox, TitleComponent, SvgIcon, TagComponent },
    props: {
        data: {
            type: Array,
            required: true
        },
        loading: Boolean,
        type: String,
        date: String || Number,
        participant: String || Number,

    },
    methods: {
        getExplain(type, method) {
            if (type === 'title') {
                return method === 'expenses' ? 'Top 10 Highest Spending Places' : 'Top 10 Most Visited Places';
            } else {
                const dateDescription = this.getDateDescription();
                return method === 'expenses' ? `Tier List of the highest spending places on ${dateDescription} ${this.getUserDescription()}` : 'Top 10 Most Visited Places';
            }
        },

        getDate(date) {
            return date === 'global' ? 'Entire Period' : date;
        },

        getUser(user) {
            return user ? 'of the participant ' + user : '';
        },

        getDateDescription() {
            return this.getDate(this.date);
        },

        getUserDescription() {
            return this.getUser(this.participant);
        },

        getIndicator(method, value) {
            const indicator = value > 0 ? 'Earnings' : 'Expenses';
            return method === 'expenses' ? indicator : 'Visits';
        },

        getColor(method, value) {
            if (method === 'frequency' || value === 0) {
                return 'bg-[#f6f6f6]';
            }
            if (method === 'expenses') {
                return value > 0 ? 'bg-green-100' : 'bg-red-100';
            }
        },
        setPlace(place){
            this.$emit('placeClicked', place);
        }
    }
}
</script>
<style scoped></style>