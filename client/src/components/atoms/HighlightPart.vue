<template>
    <span class="px-2 bg-slate-100 rounded-full font-medium"> {{ text }}</span>
</template>
<script>
export default {
    props: {
        text: { type: String, required: true}
    }
}
</script>