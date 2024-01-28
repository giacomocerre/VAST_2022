<template>
    <div v-if="data">
        <div class="p-2 mt-3">
            <h3 class="mt-2">
                <span class="border-2 p-2 rounded-full border-black float-left">
                    <svg-icon :icon="data.type.toLowerCase()" width="w-6" />
                </span>
                <span class="text-2xl text-[#333] relative ml-3 font-bold">
                    {{ data.type }}
                </span>
                <span class="relative left-3 bottom-2">
                    <span class="text-[#999] flex mt-2 text-sm">
                        <svg-icon icon="hashtag" width="w-2" /> {{ data.id }}
                    </span>
                </span>
            </h3>
            <div class=" mt-5">
                <tag-component :text="data.buildingId" icon="building" classes="text-xs bg-slate-100" tooltip="Building ID" />
                <tag-component v-if="data.maxOccupancy" :text="data.maxOccupancy" icon="rest" classes="text-xs bg-slate-100" tooltip="Max Occupacy" />
                <tag-component v-if="data.numberOfRooms" :text="data.numberOfRooms" icon="rooms" classes="text-xs bg-slate-100" tooltip="Number of Rooms"/>
            </div>
            <jobs-view v-if="data.jobs" :data="data"/>
            <activity-view v-if="data.cost" :data="data"/>
        </div>
    </div>
    <div v-else>
        <title-component text="Info About Place"
            subtitle="For view information about a place click on one place on map or top list."
            subtitleClasses="font text-sm"
            titleClasses="relative flex items-center text-xl dark:text-gray-600 font-bold capitalize" />
    </div>
</template>
<script>
import TitleComponent from '../atoms/TitleComponent.vue';
import SvgIcon from '../atoms/SvgIcon.vue';
import TagComponent from '../atoms/TagComponent.vue';
import JobsView from '../widgets/JobsView.vue';
import ActivityView from '../widgets/ActivityView.vue';

export default {
    components: { TitleComponent, SvgIcon, TagComponent, JobsView, ActivityView },
    props: {
        data: {
            type: Object,
            required: true
        }
    },

}
</script>
