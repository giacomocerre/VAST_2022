<template>
    <div class="tooltip px-6 py-4 border z-10">
        <h4 class="font-bold mb-2">{{ title }} <span v-if="extra" class="">{{ extra }}</span></h4>
        <p class="text-sm mb-1"><span class="font-bold">{{ measure }}: </span><span
                class="bg-blue-100 py-1 relative top-0.5 px-2 rounded-full">{{ value }}</span></p>
        <span v-for="tag in tags" :key="tag"
            class="mt-3 text-xs inline-block bg-gray-200 rounded-full px-2 py-1 font-semibold text-gray-700 mr-1">
            {{ tag }}
        </span>
    </div>
</template>
<script>
export default {

    props: {
        title: String,
        value: String || Number,
        extra: String || null,
        tags: Array,
        measure: String
    }

}
</script>
<style scoped>
.tooltip {
    position: absolute;
    color: #333;
    padding: 0.5rem;
    border-radius: 4px;
    pointer-events: none;
    background: #f6f6f6;
}
</style>