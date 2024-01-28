<template>
    <span class="py-2 px-3 inline-flex items-cente rounded mr-2" :class="classes" @mouseover="showTooltip" @mouseout="hideTooltip">
        <svg-icon :icon="icon" class="w-2" /><span class="ml-2 cursor-default">{{ text }}</span>
    </span>
    <span v-if="tooltipVisible && tooltip" class="relative right-12 bottom-8 w-full z-10">
        <span class="bg-[#f6f6f6] p-1 w-32 text-center rounded-lg border border-gray-100 shadow-lg absolute z-10">{{ tooltip }}</span>
    </span>
</template>
<script>
import SvgIcon from './SvgIcon.vue';
export default {
    components: { SvgIcon },
    props: {
        text: { type:String, required:true },
        icon: { type:String },
        classes: { type:String, default:'bg-slate-100'},
        tooltip: {type:String },
    },
    data() {
        return {
            tooltipVisible: false
        }
    },
    methods: {
        showTooltip() {
            this.tooltipVisible = true;
        },
        hideTooltip() {
            this.tooltipVisible = false;
        }
    }  
}
</script>