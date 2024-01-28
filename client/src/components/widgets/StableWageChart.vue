<template>
    <div>
        <title-component :text="this.data.info.title" :subtitle="this.data.info.description"
            subtitleClasses="font ml-10 text-sm"
            titleClasses="relative ml-10 mt-5 flex items-center text-xl dark:text-gray-600 font-bold capitalize" />
        <svg class="w-full h-80 mb-5" ref="chart"></svg>
    </div>
</template>
  
<script>
import * as d3 from 'd3';
import TitleComponent from '../atoms/TitleComponent.vue';

export default {
    components: { TitleComponent },
    props: {
        data: Object,
        range: String
    },
    data() {
        return {
            svg: null,
            width: 0,
            height: 0,
            margin: { top: 50, right: 100, bottom: 40, left: 60 },
            xScale: null,
            yScaleLeft: null,
            yScaleRight: null,
            brush: null,
            selectedRange: this.range
        };
    },
    mounted() {
        this.$nextTick(() => {
            this.drawChart();
        });
    },
    watch: {
        data: {
            handler: 'updateChart',
            deep: true,
        },
        range: {
            handler: 'updateBrush',
            deep: true,
        }
    },
    methods: {
        drawChart() {
            this.svg = d3.select(this.$refs.chart);
            const svgElement = this.svg.node();
            if (svgElement) {
                this.svg.selectAll('*').remove();

                this.width = this.svg.node().getBoundingClientRect().width;
                this.height = this.svg.node().getBoundingClientRect().height;

                this.xScale = d3
                    .scaleBand()
                    .domain(this.data.data.map((d) => d.id))
                    .range([this.margin.left, this.width - this.margin.right])
                    .padding(0.1);

                this.yScaleLeft = d3
                    .scaleLinear()
                    .domain([0, d3.max(this.data.data, (d) => d.stable)])
                    .range([this.height - this.margin.bottom, this.margin.top]);

                this.yScaleRight = d3
                    .scaleLinear()
                    .domain([0, d3.max(this.data.data, (d) => d.averageWage)])
                    .range([this.height - this.margin.bottom, this.margin.top]);

                const line = d3
                    .line()
                    .x((d) => this.xScale(d.id) + this.xScale.bandwidth() / 2)
                    .y((d) => this.yScaleLeft(d.stable))
                    .curve(d3.curveBasis);

                this.svg
                    .attr('width', this.width + this.margin.left + this.margin.right)
                    .attr('height', this.height + this.margin.top + this.margin.bottom)
                    .append('g')
                    .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

                this.svg
                    .append('g')
                    .attr('transform', `translate(0,${this.height - this.margin.bottom})`)
                    .call(d3.axisBottom(this.xScale))
                    .attr('class', 'Xaxis')

                this.svg
                    .append('g')
                    .attr('transform', `translate(${this.margin.left},0)`)
                    .call(d3.axisLeft(this.yScaleLeft))
                    .attr("class", "axisLeft");

                this.svg
                    .append('g')
                    .attr('transform', `translate(${this.width - this.margin.right},0)`)
                    .call(d3.axisRight(this.yScaleRight))
                    .attr("class", "axisRight");

                this.svg
                    .selectAll('rect')
                    .data(this.data.data)
                    .enter()
                    .append('rect')
                    .attr('x', (d) => this.xScale(d.id))
                    .attr('y', (d) => this.yScaleRight(d.averageWage))
                    .attr('width', this.xScale.bandwidth())
                    .attr('height', (d) => this.height - this.margin.bottom - this.yScaleRight(d.averageWage))
                    .attr('fill', 'orange');

                this.svg
                    .append('path')
                    .datum(this.data.data)
                    .attr('fill', 'none')
                    .attr('stroke', 'steelblue')
                    .attr('stroke-width', 2)
                    .attr('d', line)
                    .attr('class', 'stable-line')

                this.svg.append('text')
                    .attr('x', this.width / 2)
                    .attr('y', this.height - 5)
                    .attr('text-anchor', 'middle')
                    .classed('fill-gray-500', true)
                    .classed('text-xs', true)
                    .classed('age-axes', true)
                    .text('Age')

                this.svg.append('text')
                    .attr('transform', 'rotate(-90)')
                    .attr('x', -this.height / 2)
                    .attr('y', 10)
                    .attr('dy', '1em')
                    .attr('text-anchor', 'middle')
                    .classed('fill-gray-500', true)
                    .classed('text-xs', true)
                    .text('Stability (%)');

                this.svg.append('text')
                    .attr('transform', 'rotate(-90)')
                    .attr('x', -this.height / 2)
                    .attr('y', this.width - 50)
                    .attr('dy', '1em')
                    .attr('text-anchor', 'middle')
                    .classed('fill-gray-500', true)
                    .classed('text-xs', true)
                    .text('Average Wage');

                // Call brush initialization
                this.initBrush();
            }
        },

        initBrush() {
            this.brush = d3
                .brushX()
                .extent([
                    [this.margin.left, this.margin.top],
                    [this.width - this.margin.right, this.height - this.margin.bottom],
                ])
                .on('end', this.brushEnd);

            this.svg.append('g').attr('class', 'brush').call(this.brush).raise();
        },

        brushEnd(event) {
            if (!event.selection) return;

            const [x0, x1] = event.selection;
            const selectedData = this.data.data.filter(
                (d) => this.xScale(d.id) + this.xScale.bandwidth() / 2 >= x0 && this.xScale(d.id) + this.xScale.bandwidth() / 2 <= x1
            );

            if (selectedData.length > 0) {
                const minX = d3.min(selectedData, (d) => d.id);
                const maxX = d3.max(selectedData, (d) => d.id);
                this.selectedRange = minX === maxX ? '' + minX : minX + '-' + maxX;
                this.$emit('brushSelected', this.selectedRange);
                // Clear the selection after emitting data
                this.svg.select('.brush').call(this.brush.move, null)
            }
        },

        updateBrush() {
            // Update brush when range prop changes
            this.brush.extent([
                [this.margin.left, this.margin.top],
                [this.width - this.margin.right, this.height - this.margin.bottom],
            ]);

            this.svg.select('.brush').call(this.brush).raise();
        },
        updateChart() {
            // Update scales with new data
            this.xScale.domain(this.data.data.map((d) => d.id));
            this.yScaleRight.domain([0, d3.max(this.data.data, (d) => d.averageWage)]);
            this.yScaleLeft.domain([0, d3.max(this.data.data, (d) => d.stable)]);

            // Update X axis
            this.svg
                .select('.Xaxis')
                .transition()
                .duration(2000)
                .call(d3.axisBottom(this.xScale));

            // Update left Y axis
            this.svg
                .select('.axisLeft')
                .transition()
                .duration(2000)
                .call(d3.axisLeft(this.yScaleLeft));

            // Update right Y axis
            this.svg
                .select('.axisRight')
                .transition()
                .duration(2000)
                .call(d3.axisRight(this.yScaleRight));

            // Update existing rects and remove extra rects
            const rects = this.svg
                .selectAll('rect')
                .data(this.data.data, (d) => d.id);

            rects.exit().remove();

            rects.enter()
                .append('rect')
                .attr('fill', 'orange')
                .merge(rects)
                .transition()
                .duration(2000)
                .attr('x', (d) => this.xScale(d.id))
                .attr('y', (d) => this.yScaleRight(d.averageWage))
                .attr('width', this.xScale.bandwidth())
                .attr('height', (d) => this.height - this.margin.bottom - this.yScaleRight(d.averageWage));

            // Append/update the line after the rectangles
            const line = d3
                .line()
                .x((d) => this.xScale(d.id) + this.xScale.bandwidth() / 2)
                .y((d) => this.yScaleLeft(d.stable))
                .curve(d3.curveBasis);

            this.svg
                .select('.stable-line')
                .datum(this.data.data)
                .transition()
                .duration(2000)
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr('stroke-width', 2)
                .attr('d', line)
                .attr('class', 'stable-line');

            // Update the text after updating the chart
            if (this.range.split('-').length > 1) {
                this.svg.select('.age-axes').text('Age');
                this.updateBrush();
            } else {
                this.svg.select('.age-axes').text('All ' + this.selectedRange + ' Year Old Participant Id');
            }
        }


    },
};
</script>
