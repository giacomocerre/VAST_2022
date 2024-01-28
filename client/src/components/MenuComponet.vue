<template>
    <nav class="flex flex-1 flex-col gap-y-4 pt-10">
        <span v-for="(item, key) in menuItems" :key="key" class="group relative rounded-xl p-2 hover:bg-gray-50"
            :class="{ 'bg-gray-100 text-blue-600': selectedIndex === key }"
            @click="handleClick(key, item.path)">
            <div :class="item.animated ? 'animate-pulse text-red-500' : ''">
                <svg-icon :icon="item.icon" width="w-6"/>
            </div>
            <div class="absolute inset-y-0 left-12 hidden items-center group-hover:flex">
                <div
                    class="relative whitespace-nowrap rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 drop-shadow-lg">
                    <div class="absolute inset-0 -left-1 flex items-center">
                        <div class="h-2 w-2 rotate-45 bg-white"></div>
                    </div>
                    {{ item.menu }}
                </div>
            </div>
        </span>
    </nav>
</template>
  
<script>
import SvgIcon from "./atoms/SvgIcon.vue";

export default {
    components: { SvgIcon },
    props: {
        menuItems: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            selectedIndex: "overview",
        };
    },
    methods: {
        handleClick(key, path) {
            this.selectedIndex = key;
            this.$emit("menuSelectedItem", path);
        },
    },
};
</script>
  