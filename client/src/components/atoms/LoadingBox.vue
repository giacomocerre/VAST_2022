<template>
    <div class="bg-[#ddd] flex justify-center items-center mt-5 h-30 w-full p-5 loader">{{ content }}</div>
</template>
<script>
export default {
    props: {
        content: String
    }
}
</script>
<style scoped>
.loading-animation {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    font-size: 18px;
    color: gray;
    background: #f6f6f6;
}

.loader {
    font-weight: bold;
    color: #333;
    font-size: 12px;
    animation: l1 2s linear infinite alternate;
}

@keyframes l1 {
    to {
        opacity: 0.2
    }
}
</style>