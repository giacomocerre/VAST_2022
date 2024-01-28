<template lang="">
    <h4 @click="toggleContent"
                    class="font-bold mt-5 mb-5 text-[#333] text-md border-b pb-2 ml-2 flex items-center relative">
                    {{title}} {{ type }}s <svg-icon :icon="showContent ? 'up' : 'down'"
                        class="absolute right-10" width="w-6" /></h4>
    <div v-if="showContent">
        <div
                        class="bg-[#fff] border rounded-md shadow-md mt-5 px-2 py-8  hover:bg-blue-50 hover:border-gray-100 transition ease-in-out duration-200">
                        <div class="flex item-center relative grid-cols-3">
                            <div class="flex col-span-1">
                                <div class="flex items-center justify-center bg-blue-100 w-10 h-10 ml-3 rounded-full">
                                    <svg-icon :icon="icon" width="w-6" class="text-blue-500" />
                                </div>
                                <div class="ml-5 w-fit">
                                    <h4 class="font-bold text-md">{{idType}} #{{ id[0] }}</h4>
                                    <p class="text-xs">{{ dataExplain[0] }}</p>
                                </div>
                            </div>
                            <div class="relative right-5 top-10 col-span-1">
                                <circle-progress :percent="data[0].percentage" />
                            </div>
                            <div class="absolute right-5 col-span-1">
                                <tag-component icon="path"
                                    :text="data[0].frequency + where + numbers"
                                    :tooltip="tooltips[0]"
                                    classes="text-xs bg-slate-100" />
                            </div>
                        </div>
                    </div>
                    <div
                        class="bg-[#fff] border rounded-md shadow-md mt-5 px-2 py-8 hover:bg-yellow-50 hover:border-yellow-100 transition ease-in-out duration-200">
                        <div class="flex item-center relative grid-cols-3">
                            <div class="flex col-span-1">
                                <div class="flex items-center justify-center bg-orange-100 w-10 h-10 ml-3 rounded-full">
                                    <svg-icon :icon="icon" width="w-6" class="text-orange-500" />
                                </div>
                                <div class="ml-5 w-fit">
                                    <h4 class="font-bold text-md">{{idType}} #{{ id[1] }}</h4>
                                    <p class="text-xs">{{ dataExplain[1] }}</p>
                                </div>
                            </div>
                            <div class="relative right-5 top-10 col-span-1">
                                <circle-progress :percent="data[1].percentage" color="text-orange-500" />
                            </div>
                            <div class="absolute right-5 col-span-1">
                                <tag-component icon="path"
                                    :text="data[1].frequency + where + numbers"
                                    :tooltip="tooltips[1]"
                                    classes="text-xs bg-orange-100 text-orange-600" />
                            </div>
                        </div>
                    </div>
    </div>
</template>
<script>
import TagComponent from '../atoms/TagComponent.vue';
import CircleProgress from '../atoms/CircleProgress.vue';
import SvgIcon from '../atoms/SvgIcon.vue';
export default {
    components: { TagComponent, CircleProgress, SvgIcon },
    props: {
        data: {
            type: Object,
            required: true,
        },
        titile: String,
        icon: String,
        where: String,
        title: {
            type: String,
            required: true,
        },
        id: Array,
        numbers: {
            type: Number || String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        particpantId: {
            type: Number || String,
                required: true,
        },
        idType: String,
        dataExplain: {
            type: Array,
            required: true,
        },
        tooltips: Array
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
    },
}
</script>
<style lang="">
    
</style>