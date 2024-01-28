<template>
    <div>
        <title-component :text="`${filter} Rich Distribution`"
            :subtitle="`Lorenz Curve Distribution of the ${filter} wage distribution`" subtitleClasses="font ml-10 text-sm"
            titleClasses="relative ml-10 mt-5 flex items-center text-xl dark:text-gray-600 font-bold capitalize" />
        <svg class="w-11/12 h-80 mb-5" ref="lorenzChart"></svg>
    </div>
</template>
  
<script>
import * as d3 from 'd3';
import TitleComponent from '../atoms/TitleComponent.vue';

export default {
    components: { TitleComponent },
    props: {
        data: {
            type: Object,
            required: true,
        },
        filter: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            svg: null,
            width: 0,
            height: 0,
            margin: { top: 50, right: 20, bottom: 40, left: 60 },
            yScale: 0,
            xScale: 0
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
            deeper: true,
        },
    },
    methods: {
        drawChart() {
            this.svg = d3.select(this.$refs.lorenzChart);
            if (this.svg.node()) {
                // Pulisci il contenuto SVG prima di ridisegnare
                this.svg.selectAll('*').remove();

                const { values } = this.data;

                // Dimensioni del grafico
                this.width = this.svg.node().getBoundingClientRect().width;
                this.height = this.svg.node().getBoundingClientRect().height;

                // Crea la scala X e Y
                this.xScale = d3.scaleLinear().domain([0, 1]).range([this.margin.left, this.width - this.margin.right]);
                this.yScale = d3.scaleLinear().domain([0, 1]).range([this.height - this.margin.bottom, this.margin.top]);

                // Crea la linea della curva di Lorenz
                const line = d3.line()
                    .x((d, i) => this.xScale(i / (values.length - 1)))
                    .y(d => this.yScale(d));

                // Aggiungi la linea al grafico
                this.svg.append('path')
                    .datum(values)
                    .attr('fill', 'none')
                    .attr('stroke', 'rgb(24,130,134)')
                    .attr('stroke-width', 4)
                    .attr('d', line)
                    .attr('class', 'pathLine')

                // Aggiungi la linea di adattamento dalla prima all'ultima coppia di valori
                const fitLine = d3.line()
                    .x(d => this.xScale(d[0]))
                    .y(d => this.yScale(d[1]));

                this.svg.append('path')
                    .datum([[0, values[0]], [1, values[values.length - 1]]])
                    .attr('fill', 'none')
                    .attr('stroke', 'rgb(242,131,0)') // Change color as needed
                    .attr('stroke-width', 2)
                    .style("stroke-dasharray", "3,3")//dashed array for line
                    .attr('d', fitLine);

                // Aggiungi l'area sopra la curva e sotto la linea di adattamento
                const area = d3.area()
                    .x((d, i) => this.xScale(i / (values.length - 1)))
                    .y0(d => this.yScale(d[1])) // Usa il valore minimo dell'asse Y come base
                    .y1(d => this.yScale(d))

                this.svg.append('path')
                    .datum(values)
                    .attr('fill', 'rgb(180,224,227)') // Cambia colore e opacità come necessario
                    .attr('d', area)
                    .attr('class', 'pathArea')

                // Add X-axis
                this.svg.append('g')
                    .attr('transform', `translate(0, ${this.height - this.margin.bottom})`)
                    .call(d3.axisBottom(this.xScale))
                    .selectAll('text')  // Select all the text elements for customization
                    .style('text-anchor', 'end')  // Align text to the end of tick marks
                    .attr('dx', '-.8em')  // Adjust the position of text
                    .attr('dy', '.15em')

                // Add Y-axis
                this.svg.append('g')
                    .attr('transform', `translate(${this.margin.left}, 0)`)
                    .call(d3.axisLeft(this.yScale))
                    .selectAll('text')  // Select all the text elements for customization
                    .style('text-anchor', 'end')  // Align text to the end of tick marks
                    .attr('dx', '-.8em')  // Adjust the position of text
                    .attr('dy', '.15em');

                // Style to remove axis lines and leave only increments
                this.svg.selectAll('.domain').remove();  // Remove axis lines
                this.svg.selectAll('.tick line').remove();  // Remove tick lines, leaving only tick marks


                // Aggiungi titoli e etichette
                this.svg.append('text')
                    .attr('x', this.width / 2)
                    .attr('y', this.height - 5)
                    .attr('text-anchor', 'middle')
                    .classed('fill-gray-500', true)
                    .classed('text-xs', true)
                    .text('Cumulative Share of Population');

                this.svg.append('text')
                    .attr('transform', 'rotate(-90)')
                    .attr('x', -this.height / 2)
                    .attr('y', 10)
                    .attr('dy', '1em')
                    .attr('text-anchor', 'middle')
                    .classed('fill-gray-500', true)
                    .classed('text-xs', true)
                    .text('Cumulative Share of Income');
            }
        },
        updateChart() {
            const { values } = this.data;
            // Crea la linea della curva di Lorenz
            const line = d3.line()
                .x((d, i) => this.xScale(i / (values.length - 1)))
                .y(d => this.yScale(d));

            // Aggiungi la linea al grafico
            this.svg.select('.pathLine')
                .datum(values)
                .transition()
                .duration(500)
                .attr('fill', 'none')
                .attr('stroke', 'rgb(24,130,134)')
                .attr('stroke-width', 4)
                .attr('d', line)
                .attr('class', 'pathLine')

            // Aggiungi l'area sopra la curva e sotto la linea di adattamento
            const area = d3.area()
                .x((d, i) => this.xScale(i / (values.length - 1)))
                .y0(d => this.yScale(d[1])) // Usa il valore minimo dell'asse Y come base
                .y1(d => this.yScale(d))

            this.svg.select('.pathArea')
                .datum(values)
                .transition()
                .duration(500)
                .attr('fill', 'rgb(180,224,227)') // Cambia colore e opacità come necessario
                .attr('d', area);
        }
    },
};
</script>
  