<template>
    <div class="chart-container">
        <h2 v-if="title">{{ title }}</h2>
        <p v-if="description">{{ description }}</p>
        <svg :width="width" :height="height" :ref="refer"></svg>
    </div>
</template>
<script>
import * as d3 from 'd3';

export default {
    props: {
        width: {
            type: Number,
            default: 600
        },
        height: {
            type: Number,
            default: 300
        },
        refer: {
            type: String,
            required: true
        },
        title: {
            type: String
        },
        description: {
            type: String
        },

        draw: {
            type: Function,
            required: true
        }
    },
    mounted() {
        this.drawChart();
    },
    methods: {
        drawChart() {
            const svg = d3.select(this.$refs[this.refer]);
            svg.selectAll('*').remove();
            this.draw(svg);
        }
    }
}
</script>
<style scoped>
.chart-container {
    height: 100%;
}
</style>