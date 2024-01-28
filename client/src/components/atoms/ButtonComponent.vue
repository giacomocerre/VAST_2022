<template>
    <span @click="handleClick"
        class="bg-[#fff] hover:bg-blue-400 hover:text-white hover:font-bold cursor-pointer text-xs py-2 px-3 inline-flex items-center rounded-full py-0.5 px-1 w-34 rounded absolute right-20 cursor-pointer">
        <svg-icon v-if="icon" :icon="icon" width="w-3" /><span class="ml-2">{{ text }}</span>
    </span>
</template>
<script>
import SvgIcon from './SvgIcon.vue';
export default {
    components:{ SvgIcon},
    props: {
        text: {
            type: String,
            required: true,
        },
        icon: {
            type: String
        }
    },
    methods: {
     handleClick() {
        this.$emit('clicked', true);
     }  
    }
}
</script>