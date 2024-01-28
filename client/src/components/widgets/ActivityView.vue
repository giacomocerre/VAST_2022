<template>
    <h4 @click="toggleContent" class="font-bold mt-5 border-b pb-2 flex items-center relative">{{ data.type }} {{ data.cost.type }} <svg-icon :icon=" showContent ? 'up': 'down'" class="absolute right-10" width="w-6"/></h4>

    <div v-if="showContent" class="bg-white border shadow-md w-fit p-6 mt-5">
        <p class="text-sm">In this <highlight-part :text="data.type"/> the <highlight-part :text="data.cost.type"/> are:</p>
        <tag-component :text="'~'+data.cost.amount.toFixed(0) + '$'" icon="wage" classes="mt-5 text-sm bg-slate-100"
            :tooltip="data.cost.type" />
    </div>
</template>
<script>
import TagComponent from '../atoms/TagComponent.vue';
import HighlightPart from '../atoms/HighlightPart.vue';
import SvgIcon from '../atoms/SvgIcon.vue';
export default {
    components: { TagComponent, HighlightPart, SvgIcon },
    props: {
        data: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            showContent: false
        }
    },
    methods: {
        toggleContent(){
            this.showContent = !this.showContent
        }
    }

}
</script>
