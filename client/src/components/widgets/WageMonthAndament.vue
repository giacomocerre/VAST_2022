<template>
    <div>
        <svg ref="wage" class="w-full mb-5 mt-2"></svg>
        <div ref="tooltip" class="tooltip"
            style="position: absolute; display: none; background: white; padding: 5px; border: 1px solid #ddd; border-radius: 5px;">
        </div>
    </div>
</template>

<script>
import * as d3 from 'd3';

export default {
    components: {},
    props: {
        data: {
            type: Array,
            required: true,
        },
        participant: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            svg: null,
            width: 0,
            height: 0,  
            margin: { top: 0, right: 10, bottom: 40, left: 40 },
            xScale: null,
            xAxis: null,
            yScale: null,
            opacity: { hovered: 2, nonHovered: 0.8},
            stroke_width: { hovered: 2, nonHovered: 0.5 },
            stroke: { hovered: 'orange', nonHovered: 'rgb(137, 172, 125)' },
            dataReady: false,
        };
    },
    mounted() {
        this.$nextTick(() => {
            setTimeout(() => {
                this.dataReady = true;
                this.drawChart();
            }, 2000);
        });
    },
    watch: {
        data: {
            handler: 'drawChart',
            deep: true,
        },
        participant: {
            handler: 'drawChart',
            deep: true,
        },
    },
    methods: {
        // Function to show tooltip
        showTooltip(event, x, value = null) {
            const tooltip = this.$refs.tooltip;
            if (value) {
                tooltip.innerHTML = `<strong>Participant ID:</strong> ${this.participant}</br><strong>Value:</strong> ${value.toFixed(2)}</br><strong>Month:</strong> ${x}`;

            } else {
                tooltip.innerHTML = `<strong>Participant ID:</strong> ${x}`;
            }
            tooltip.style.display = 'block';
            tooltip.style.left = event.pageX + 'px';
            tooltip.style.top = event.pageY + 'px';
        },

        // Function to hide tooltip
        hideTooltip() {
            const tooltip = this.$refs.tooltip;
            tooltip.style.display = 'none';
        },

        updateHoveredLine(hover, participantId) {
            this.svg.selectAll('.line')
                .attr("stroke-width", d => this.getLineStrokeWidth(d, hover, participantId))
                .attr("opacity", d => this.getLineOpacity(d, hover, participantId))
                .attr('stroke', d => this.getLineColor(d, hover, participantId));
        },

        getLineStrokeWidth(d, hover, participantId) {
            if (hover) {
                return (d.participantId === participantId || d.participantId === this.participant) ? this.stroke_width.hovered : this.stroke_width.nonHovered;
            } else {
                return (d.participantId === this.participant) ? this.stroke_width.hovered : this.stroke_width.nonHovered;
            }
        },

        getLineOpacity(d, hover, participantId) {
            if (hover && (d.participantId === participantId || d.participantId === this.participant)) {
                return this.opacity.hovered;
            } else if (!hover && d.participantId === this.participant) {
                return this.opacity.hovered;
            } else {
                return this.opacity.nonHovered;
            }
        },

        getLineColor(d, hover, participantId) {
            if (hover && d.participantId === participantId) {
                return this.stroke.hovered;
            } else {
                return this.stroke.nonHovered;
            }
        },

        drawChart() {
            this.svg = d3.select(this.$refs.wage);
            const svgElement = this.svg.node();
            if (svgElement) {
                this.svg.selectAll('*').remove();
                this.width = svgElement.getBoundingClientRect().width;
                this.height = 250;

                const monthFormat = d3.timeFormat('%m');

                this.svg.attr('width', this.width)
                    .attr('height', this.height + 50);

                this.yScale = d3
                    .scaleLinear()
                    .domain([0, 24000])
                    .range([this.height, 20]);

                this.xScale = d3
                    .scaleTime()
                    .domain([
                        new Date('2022-03'),
                        new Date('2023-05')
                    ])
                    .range([this.margin.left, this.width - this.margin.right]);

                this.xAxis = d3
                    .axisBottom(this.xScale)
                    .tickFormat(monthFormat);

                this.svg
                    .append('g')
                    .attr('transform', `translate(${0}, ${this.height})`)
                    .call(this.xAxis)

                this.svg.append('g')
                    .attr('transform', `translate(${this.margin.left}, ${0})`)
                    .call(d3.axisLeft(this.yScale));

                const line = d3
                    .line()
                    .y((d) => (this.yScale(d.value)))
                    .x((d) => this.xScale(new Date(d.timestamp)))
                    .curve(d3.curveCardinal);

                if (this.participant) {
                    this.svg
                        .selectAll('.dot')
                        .data(this.data)
                        .enter()
                        .append('g')
                        .attr('class', 'dot')
                        .selectAll('circle')
                        .data(d => d.wages)
                        .enter()
                        .append('circle')
                        .attr('cx', d => this.xScale(new Date(d.timestamp)))
                        .attr('cy', d => this.yScale(d.value))
                        .attr('r', 3)
                        .attr('fill', this.nonHovered)
                        .attr('opacity', this.opacity.hovered)
                        .on('mouseover', (event, d) => {
                            this.showTooltip(event, d.timestamp, d.value);
                            this.updateHoveredLine(true, d.participantId);
                        })
                        .on('mouseout', (event, d) => {
                            this.hideTooltip();
                            this.updateHoveredLine(false, d.participantId);
                        });
                }

                // Add lines for data with more than one point
                this.svg
                    .selectAll('.line')
                    .data(this.data.filter(d => d.wages.length > 1))
                    .enter()
                    .append('path')
                    .attr('class', (d) => 'line' + (d.participantId === this.participant ? ' line-selected' : ''))
                    .attr('d', (d) => line(d.wages))
                    .attr('fill', 'none')
                    .attr('opacity', this.opacity.nonHovered)
                    .attr('stroke', this.stroke.nonHovered)
                    .attr("stroke-width", this.stroke_width.nonHovered)
                    .on('mouseover', (event, d) => {
                        this.showTooltip(event, d.participantId);
                        if (!this.participant) {
                            this.updateHoveredLine(true, d.participantId)
                        }
                    })
                    .on('mouseout', (event, d) => {
                        this.hideTooltip();
                        if (!this.participant) {
                            this.updateHoveredLine(false, d.participantId)
                        }
                    });

                this.svg.selectAll(".line-selected").raise();
                this.svg.selectAll(".dot").raise();
            }
        },

    },
};
</script>

<style scoped>
.tooltip {
    font-size: 12px;
    z-index: 999;
}

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

.loader:before {
    content: "Loading Wages Months Data..."
}

@keyframes l1 {
    to {
        opacity: 0.2
    }
}
</style>
