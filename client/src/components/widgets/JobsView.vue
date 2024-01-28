<template>
    <h4 @click="toggleContent" class="font-bold mt-5 border-b pb-2 flex items-center relative">Jobs Positions <highlight-part :text="data.jobs.length" class="font-normal text-xs px-3 ml-2 mr-2"/> <svg-icon :icon=" showContent ? 'up': 'down'" class="absolute right-10" width="w-6"/></h4>
    <div v-if="showContent" class="h-fit overflow-hidden">
        <div v-for="job in data.jobs" :key="job.id" class="w-full">
            <div class="float-left mt-5 rounded-lg relative bg-white border shadow-md  w-11/12 p-2">
                <p class="ml-2 mt-2 text-sm font-bold flex">Job <svg-icon icon="hashtag" class="ml-1" width="w-2" />{{
                    job.id }}
                </p>
                <span class="text-xs px-2">{{ job.startTime }} - {{ job.endTime }}</span>
                <p class="text-xs font-bold flex text-[#666] pl-1"></p>
                <div class="flex items-center ml-2">
                    <div v-for="day in week" :key="day" class="mt-2">
                        <p class="text-[10px] relative left-1"> {{ day[0] }}</p>
                        <div class="text-xs p-1 m-1 text-white rounded mt-2"
                            :class="job.daysToWork.includes(day) ? 'bg-green-500' : 'bg-red-500'"></div>
                    </div>
                </div>
                <div class="text-xs mt-2 ml-2 mb-2">
                    <tag-component :text="'~'+job.hourlyRate.toFixed(0) + '$'" icon="wage" tooltip="Hourly Rate" classes="bg-green-100"/>
                    <tag-component :text="job.educationRequirement" icon="graduate" tooltip="Education Requirment" classes="bg-orange-100"/>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import SvgIcon from '../atoms/SvgIcon.vue';
import TagComponent from '../atoms/TagComponent.vue';
import HighlightPart from '../atoms/HighlightPart.vue';
export default {
    components: { SvgIcon, TagComponent, HighlightPart },
    props: {
        data: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            week: [
                "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
            ],
            showContent: false,
        }
    },
    methods: {
        toggleContent() {
            this.showContent = !this.showContent;
        }
    }
}
</script>
