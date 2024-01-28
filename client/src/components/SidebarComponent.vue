<template>
    <div class="flex h-[4.5rem] w-full items-center justify-center border-b border-gray-200 p-2">
        <h1>UEP</h1>
    </div>
    <MenuComponent :menu-items="VIEWS" @menuSelectedItem="menuSelection" />
    <div class="flex flex-col items-center gap-y-4 py-10 z-50">
        <button class="group relative rounded-xl p-2 text-gray-400 hover:bg-gray-100">
            <SvgIcon icon="info" class="w-6" />
        </button>
    </div>
</template>
<script>
import MenuComponent from "../components/MenuComponet.vue";
import SvgIcon from "./atoms/SvgIcon.vue";
import { VIEWS } from "@/config/config";
export default {
    components: { MenuComponent, SvgIcon },
    emits: ["changeDashboardView"],
    data() {
        return { VIEWS };
    },
    methods: {
        menuSelection(view) {
            this.$emit("changeDashboardView", view);
        },
    },
};
</script>