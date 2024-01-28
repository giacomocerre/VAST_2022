<template>
    <div :class="['bg-white', 'shadow', 'rounded-lg', 'p-4', 'sm:p-6', 'xl:p-7', {
        'bg-gradient-to-tl via-transparent': trend && trend.value !== undefined,
        'from-green-200 shadow-green-50': trend && trend.value > 0,
        'from-red-200 shadow-rose-50': trend && trend.value < 0,
        'from-gray-200 shadow-gray-50': trend && trend.value === 0
        
    }]">
        <pop-over class="relative bottom-3 left-3" :value="description" />
        <div class="flex items-center mt-2 relative">
            <div class="flex-shrink-0">
                <span class="text-2xl sm:text-3xl leading-none font-bold text-gray-900">{{ value }}{{ unit }}</span>
                <title-component level="h2" :text="title" titleClasses="text-base text-gray-600 mt-2 font-bold" />
            </div>
            <div v-if="trend"
                :class="[trend.value === 0 ? '' : trend.value > 0 ? 'text-green-600' : 'text-red-600', 'ml-5 w-full flex items-center justify-end flex- text-base font-bold float-right absolute right-20'].concat(' ')">
                <div class="block relative">
                    <span><svg-icon :icon="trend.value === 0 ? 'arrowRight' : trend.value > 0 ? 'increase' : 'decrease'" class="absolute top-1" /><span
                            class="relative left-5">{{ trend.value }}{{ trend.unit }}</span></span><br>
                    <span class="text-xs absolute w-max">{{ trend.text }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import TitleComponent from '../atoms/TitleComponent.vue'
import SvgIcon from '../atoms/SvgIcon.vue';
import PopOver from '../atoms/PopOver.vue';
export default {
    components: { TitleComponent, SvgIcon, PopOver },
    props: {
        title: {
            type: String,
            required: true,
        },
        value: {
            type: [String, Number],
            required: true,
        },
        unit: {
            type: String,
        },
        description: {
            type: String,
            required: true,
        },
        trend: {
            type: Object,
        }
    }
}
</script>