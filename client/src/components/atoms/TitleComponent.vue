<template>
    <component :is="level" :class="titleClasses">
        {{ text }}
        <span :class="iconClasses" v-if="icon">
            <svg-icon :icon="icon.icon" :width="icon.width"/>
        </span>
    </component>
    <p v-if="subtitle" :class="subtitleClasses">{{ subtitle }}</p>
    <p v-if="note" class="text-xs mt-1 p-1 bg-orange-100 w-fit border border-orange-300 rounded"><svg-icon icon="question" class="float-left mr-2 text-orange-800"/>{{ note }}</p>

</template>
  
<script>
import SvgIcon from './SvgIcon.vue';

export default {
    components: { SvgIcon },
    props: {
        text: {
            type: String,
            required: true,
        },
        subtitle: { 
            type: String
        },
        note: {
            type: String,
        },
        icon: {
            type: Object
        },
        level: {
            type: String,
            default: 'h1',
            validator: (value) => ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(value),
        },
        titleClasses: {
            type: [String, Object, Array],
            default: () => 'mt-10 flex items-center text-3xl dark:text-gray-600 font-extrabold'
        },
        subtitleClasses: {
            type: [String, Object, Array],
            default: () => 'mt-10 flex items-center text-3xl dark:text-gray-600 font-extrabold'
        },
        iconClasses: {
            type: [String, Object, Array],
            default: () => 'mt-2 ml-2 text-green-600',
        },
    },
};
</script>
  