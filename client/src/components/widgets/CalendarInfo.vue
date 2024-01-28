<template>
    <div v-if="data" class=" mt-2">
        <div class="mt-5 mb-2 p-4 max-w-md bg-white rounded-lg border border-gray-100 shadow-lg">
            <p>Average Income for <highlight-part :text="setDate(date)"/> {{ participant ? 'for the user ' : '' }} <highlight-part v-if="participant" :text="participant"/></p>
            <p class="font-bold"><svg-icon icon="dollars" class="float-left mr-2 relative top-1" />{{
                data.data.wage.value.toFixed(2) }}$</p>
            <p class="text-xs w-fit ">
                Saving of the {{ setDate(date) }}
                <span>
                    <svg-icon :icon="data.data.saving.value > 0 ? 'arrowUp' : 'arrowDown'" class="float-right"
                        :class="data.data.saving.value > 0 ? 'text-green-600' : 'text-red-500'" />
                    <span class="float-right ml-2 font-bold"
                        :class="data.data.saving.value > 0 ? 'text-green-600' : 'text-red-500'">{{
                            data.data.saving.value }}{{ data.data.saving.unit }}</span>
                </span>
            </p>
        </div>
        <svg ref="chart" class="w-full h-64"></svg>
        <div ref="tooltip" class="tooltip" style="opacity: 0;"></div>
    </div>
</template>
  
<script>
import * as d3 from "d3";
import SvgIcon from "../atoms/SvgIcon.vue";
import HighlightPart from "../atoms/HighlightPart.vue";

export default {
    components: { SvgIcon, HighlightPart },
    props: {
        data: {
            type: Object,
            required: true,
        },
        loading: Boolean,
        date: String,
        participant: String,
    },
    data() {
        return {
            svg: null,
            width: 0,
            height: 0,
            margin: { top: 0, right: 20, bottom: 60, left: 50 },
            xScale: null,
            yScale: null,
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.drawChart();
        });
    },
    watch: {
        data: {
            handler: 'drawChart',
            deeper: true,
        },
    },
    methods: {
        setDate(date) {
            return date === 'global' ? 'Entire Period' : date
        },
        drawChart() {
            this.svg = d3.select(this.$refs.chart);
            const svgElement = this.svg.node();
            if (svgElement && this.data.data) {
                this.svg.selectAll('*').remove();

                this.width = this.svg.node().getBoundingClientRect().width;
                this.height = this.svg.node().getBoundingClientRect().height;

                const { food, recreation, education, shelter, wage } = this.data.data;
                const maxValue = Math.max(
                    Math.abs(food.value),
                    Math.abs(recreation.value),
                    Math.abs(education.value),
                    Math.abs(shelter.value),
                    Math.abs(wage.value)
                );

                this.xScale = d3
                    .scaleBand()
                    .domain(['food', 'recreation', 'education', 'shelter'])
                    .range([this.margin.left, this.width - this.margin.right])
                    .padding(0.1);

                this.yScale = d3
                    .scaleLinear()
                    .domain([0, maxValue === 0 ? 0 : maxValue + (maxValue / 3)]) // Adjusted y-axis domain
                    .range([this.height - this.margin.bottom, this.margin.top]);

                this.svg
                    .attr('width', this.width)
                    .attr('height', this.height);

                this.svg
                    .selectAll('rect')
                    .data([
                        { label: 'food', value: Math.abs(food.value), title: food.title },
                        { label: 'recreation', value: Math.abs(recreation.value), title: recreation.title },
                        { label: 'education', value: Math.abs(education.value), title: education.title },
                        { label: 'shelter', value: Math.abs(shelter.value), title: shelter.title },
                    ])
                    .enter()
                    .append('rect')
                    .attr('x', (d) => this.xScale(d.label))
                    .attr('y', (d) => this.yScale(d.value))
                    .attr('width', this.xScale.bandwidth())
                    .attr('height', (d) => this.height - this.yScale(d.value) - this.margin.bottom) // Adjusted height
                    .attr('fill', '#69b3a2')
                    .on('mouseover', (event, d) => this.showTooltip(event, d))
                    .on('mouseout', () => this.hideTooltip());

                // Adjusted transform to leave space for x-axis labels
                this.svg
                    .append('g')
                    .attr('transform', `translate(0,${this.height - this.margin.bottom})`)
                    .call(d3.axisBottom(this.xScale))
                    .selectAll('text')
                    .attr('transform', 'rotate(-45)')
                    .attr('x', -10)
                    .attr('y', 0)
                    .style('text-anchor', 'end');

                // Adjusted transform to leave space for y-axis labels
                this.svg.append('g')
                    .attr('transform', `translate(${this.margin.left},0)`)
                    .call(d3.axisLeft(this.yScale));

                // Adjusted y-coordinate for the horizontal line
                this.svg
                    .append('line')
                    .attr('x1', this.margin.left)
                    .attr('y1', this.yScale(Math.abs(this.data.data.wage.value)))
                    .attr('x2', this.width - this.margin.right)
                    .attr('y2', this.yScale(Math.abs(this.data.data.wage.value)))
                    .attr('stroke', '#999')
                    .attr('stroke-width', 2)
                    .on('mouseover', (event) => this.showTooltip(event, this.data.data.wage))
                    .on('mouseout', () => this.hideTooltip());
            }
        },
        showTooltip(event, data) {
            const tooltip = d3.select(this.$refs.tooltip);

            tooltip.transition().duration(200).style('opacity', 0.9);

            tooltip
                .html(`<strong>${data.title}</strong><br>Expenses: ${data.value.toFixed(2)}$`)
                .style('left', event.pageX - 50 + 'px')
                .style('top', event.pageY - 80 + 'px');
        },

        hideTooltip() {
            d3.select(this.$refs.tooltip).transition().duration(500).style('opacity', 0);
        },
    },

};
</script>
  
<style scoped>
.tooltip {
    position: absolute;
    background-color: white;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    pointer-events: none;
}
</style>
  