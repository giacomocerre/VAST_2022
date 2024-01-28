<template>
    <h4 class="text-md font-bold">{{ title }}
        <highlight-part :text="data.length" />
    </h4>
    <div v-if="data.length > 0">
        <div v-if="data.length > 14" class="overflow-hidden mt-3 text-xs">
            <div v-for="i in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13 ]" :key="i" class="">
                <p class="w-20 rounded shadow-md float-left flex justify-center items-center bg-slate-100 p-1 my-1 mx-2">
                    {{ data[i] }}
                </p>
            </div>
            <p
                class="float-left flex w-20 justify-center items-center p-1 my-1 mx-2 bg-slate-500 text-white rounded shadow-md">
                + {{ data.length - 11 }}
            </p>
        </div>
        <div v-else class="overflow-hidden mt-3">
            <div v-for="id in data" :key="id" class="">
                <p class="w-20 rounded shadow-md float-left flex justify-center items-center bg-slate-100 p-1 my-1 mx-2">
                    {{ id }}
                </p>
            </div>
        </div>
    </div>
    <div v-else>
        <p class="w-full text-center text-xs bg-gray-100 p-5">
        <tag-component :text="'There isn\'t ' + title + ' in this month'" icon="alert" class="text-xs" />
      </p>
    </div>
</template>
<script>
import HighlightPart from '../atoms/HighlightPart.vue';
import TagComponent from '../atoms/TagComponent.vue';
export default {
    components: {HighlightPart, TagComponent},
    props: {
        data: {
            type: Array,
            required: true,
        },
        title: {
            type: String,
            required: true,
        }
    },
};
</script>
<style lang=""></style>
