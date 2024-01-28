<template>
    <div class="relative">
        <div class="absolute -bottom-11 left-10">
            <svg class="w-20 h-20">
                <circle class="text-gray-200" stroke-width="5" stroke="currentColor" fill="transparent" r="30" cx="40"
                    cy="40" />
                <circle :class="color" stroke-width="5" :stroke-dasharray="circumference"
                    :stroke-dashoffset="circumference - percent / 100 * circumference" stroke-linecap="round"
                    stroke="currentColor" fill="transparent" r="30" cx="40" cy="40" />
            </svg>
            <span class="relative bottom-[52px] left-[26px] text-md" :class="color">{{ percent.toFixed(0) }}%</span>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        percent: {
            type: Number,
            default: 0,
        },
        color: {
            type: String,
            default: 'text-blue-500'
        }
    },
    data() {
        return {
            circumference: 30 * 2 * Math.PI,
        }
    }
}
</script>