<template>
    <div class="relative">
    <div class="p-5 border w-full shadow-md rounded-md">
        <svg ref="chart" class="mt-3 w-full"></svg>
    </div>
    <div ref="tooltip" class="tooltip" style="display: none;"></div>
</div>


</template>

<script>
import * as d3 from 'd3';

export default {
    props: {
        data: {
            type: Array,
            required: true,
        },
        filter: {
            type: String,
            required: true,
        }
    },
    data() {
        return {
            svg: null,
            width: 0,
            height: 0,
            margin: { top: 5, right: 0, bottom: 0, left: 0 },
            xScale: null,
            xAxis: null,
            yScale: null,
            tooltip: null
        }
    },
    mounted() {
        this.tooltip = d3.select(this.$refs.tooltip);
        this.drawChart();
    },
    watch: {
        data: {
            handler: 'drawChart',
            deep: true
        },
        filter: {
            handler: 'drawChart',
            deep: true
        }
    },
    methods: {
        drawChart() {
            this.svg = d3.select(this.$refs.chart);
            const svgElement = this.svg.node();
            if (this.svg.node()) {
                this.svg.selectAll('*').remove();
                this.width = svgElement.getBoundingClientRect().width;
                this.height = 40
                const svg = d3
                    .select(this.$refs.chart)
                    .attr('width', this.width - this.margin.top)
                    .attr('height', 60)
                    .append('g')
                    .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

                const x = d3
                    .scaleBand()
                    .domain(this.data.map((d) => d.month))
                    .range([0, this.width]);

                const y = d3
                    .scaleLinear()
                    .domain([d3.min(this.data, (d) => d[this.filter]), d3.max(this.data, (d) => d[this.filter])])
                    .range([this.height, 0]);

                const line = d3
                    .line()
                    .curve(d3.curveCardinal)
                    .x((d) => x(d.month) + x.bandwidth() / 2)
                    .y((d) => y(d[this.filter]));

                this.svg
                    .append('line')
                    .attr('class', 'zero-line')
                    .attr('x1', 0)
                    .attr('x2', this.width)
                    .attr('y1', y(0) + this.margin.top) // Aggiungi this.margin.top alla coordinata y1
                    .attr('y2', y(0) + this.margin.top) // Aggiungi this.margin.top alla coordinata y2
                    .attr('stroke', '#333')  // Imposta il colore della linea a rosso (puoi cambiarlo)
                    .attr('stroke-width', 0.5) // Imposta lo spessore della linea
                    .attr('stroke-dasharray', 5.5)

                svg
                    .append('path')
                    .data([this.data])
                    .attr('class', 'line')
                    .attr('d', line)
                    .attr('fill', 'none') // Rimuovi il colore di riempimento
                    .attr('stroke', 'steelblue')
                    .attr('stroke-width', 3)

                // Aggiungi cerchi per ogni punto sulla linea
                svg.selectAll('circle')
                    .data(this.data)
                    .enter().append('circle')
                    .attr('cx', (d) => x(d.month) + x.bandwidth() / 2)
                    .attr('cy', (d) => y(d[this.filter]))
                    .attr('r', 3) // Aumenta la dimensione del cerchio
                    .attr('fill', 'steelblue')
                    .on('mousemove', (event, d) => {
                        const [x, y] = d3.pointer(event, this.svg.node()); // Use d3.pointer for accurate coordinates
                        this.tooltip.style('display', 'block')
                            .html(`
                            Month: ${d.month}<br>
                            ${d[this.filter].toFixed(2)}${this.filter === 'total' ? '$' : '%'}
                            `)
                            .style('left', (x + 10) + 'px')
                            .style('top', (y - 10) + 'px')
                    })
                    // Add mouseout event listener to hide tooltip
                    .on('mouseleave', () => {
                        this.tooltip.style('display', 'none');
                    });
            }
        }
    },
};
</script>

<style>
.tooltip {
    position: absolute;
    background-color: #fff;
    border: 1px solid #ddd;
    padding: 5px;
    border-radius: 3px;
    pointer-events: none;
    font-size: 12px;
}
</style>
