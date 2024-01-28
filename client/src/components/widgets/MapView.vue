<template>
    <div class="h-fit">
        <title-component text="City Map Overview" subtitle="Interactive map overview that displays information about all the places, buildings, and paths." subtitleClasses="font text-sm"
            titleClasses="relative mt-5 flex items-center text-xl dark:text-gray-600 font-bold capitalize" />
        <div class="bg-slate-100 w-fit mt-8 ounded flex">
            <span class="py-2 px-3 inline-flex items-cente cursor-pointer hover:bg-blue-200 rounded" @click="zoomIn">
                <svg-icon icon="zoomPlus" class="w-2" />
            </span>
            <span class="py-2 px-3 inline-flex items-center cursor-pointer hover:bg-blue-200 rounded" @click="zoomOut">
                <svg-icon icon="zoomMinus" />
            </span>
            <span class="py-2 px-4 inline-flex items-center cursor-pointer border-l-1 pr-5 hover:bg-blue-200 rounded"
                @click="resetZoom">
                <svg-icon icon="reset" class="mr-2 w-2" />
                <span class="text-xs">Reset Zoom</span>
            </span>
            <div class="flex w-max gap-6 bg-white p-1" v-for="(check, index) in checks" :key="index">
                <check-component :check="check" :key="check.value" @checkChange="handleCheckChange(index, $event)" />
            </div>
        </div>
        <div ref="tooltip" class="tooltip p-4 "
            style="position: absolute; display: none; background-color: white; border: 1px solid #ccc; padding: 8px; border-radius: 4px;">
            
        <span class="py-2 px-4 inline-flex items-center cursor-pointer border-l-1 pr-5 bg-blue-200 hover:bg-blue-500 hover:text-white rounded cursor-pointer">
                <svg-icon :icon="tooltip.type.toLocaleLowerCase()" class="mr-2" width="w-5" />
                <span class="text-xs">{{tooltip.type}}</span>
        </span>
                    <br />
            <span class="font-bold pl-2 pr-2 pt-1 pb-1">Place ID: </span> {{ tooltip.id }}
        </div>

        <svg class="w-full mt-1 bg-gray-100 rounded" ref="map"></svg>

    </div>
</template>
  
<script>
import * as d3 from "d3";
import TitleComponent from "../atoms/TitleComponent.vue";
import SvgIcon from '../atoms/SvgIcon.vue';
import { buildingsColors } from '../../config/config.js';
import CheckComponent from '../CheckComponent.vue';

export default {
    components: { TitleComponent, SvgIcon, CheckComponent },
    props: {
        data: Array,
        paths: [String]
    },
    data() {
        return {
            svg: null,
            width: 0,
            height: 0,
            xScale: 0,
            yScale: 0,
            zoom: null,
            checks: [
                { value: 'Commercial', color: buildingsColors.commercial.color, active: false },
                { value: 'Residental', color: buildingsColors.residental.color, active: false },
                { value: 'School', color: buildingsColors.school.color, active: false }
            ],
            selectedBuilding: null, // New property to track the selected building
            tooltip: { type: '', id: '' }

        };
    },
    mounted() {
        this.$nextTick(() => {
            this.drawMap();
        });
    },
    watch: {
        data: {
            handler: "drawMap",
            deep: true,
        },
        checks: {
            handler: "drawMap",
            deep: true,
        },
        paths: {
            handler: 'drawConnections',
            deep: true,
        }
    },
    methods: {
        drawMap() {
            this.svg = d3.select(this.$refs.map);
            if (this.svg.node()) {
                this.svg.selectAll("*").remove();
                this.svg.attr("width", this.width).attr("height", 600);
                this.width = this.svg.node().getBoundingClientRect().width;
                this.height = this.svg.node().getBoundingClientRect().height;
                this.calcCoordinates();

                this.zoom = d3
                    .zoom()
                    .scaleExtent([0.9, 20])
                    .on("zoom", this.handleZoom);

                this.svg.call(this.zoom);

                this.drawBuildings();
                setTimeout(() => {
                    this.drawConnections();
                }, 1000); // Adjust the delay as needed
            }
        },

        drawConnections() {
    const self = this;

    // Define the marker
    this.svg
        .append('defs')
        .append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '-5 -5 10 10')
        .attr('refX', 0)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 2)
        .attr('markerHeight', 2)
        .append('path')
        .attr('d', 'M 0,0 m -5,-5 L 5,0 L -5,5 Z')
        .attr('fill', 'red');

    // Loop through each path in paths
    this.paths.forEach((path) => {
        const circleIds = path.split('-');

        // Draw connections between consecutive circles in the path
        for (let i = 0; i < circleIds.length - 1; i++) {
            const sourceId = circleIds[i];
            const targetId = circleIds[i + 1];

            // Find corresponding circle elements based on their IDs
            const sourceCircle = self.svg.select(`#place-${sourceId}`);
            const targetCircle = self.svg.select(`#place-${targetId}`);

            sourceCircle.attr('r',2).attr('fill', 'red')
            targetCircle.attr('r',2).attr('fill', 'red')


            if (sourceCircle && targetCircle) {
                // Get coordinates of the centers of the source and target circles
                const sourceX = parseFloat(sourceCircle.attr('cx'));
                const sourceY = parseFloat(sourceCircle.attr('cy'));
                const targetX = parseFloat(targetCircle.attr('cx'));
                const targetY = parseFloat(targetCircle.attr('cy'));

                // Create a curved line generator with Cardinal interpolation
                const lineGenerator = d3.line().curve(d3.curveBasis);

                // Generate the path data for the curved line
                const pathData = lineGenerator([
                    [sourceX, sourceY],
                    [targetX, targetY]
                ]);

                // Draw a curved line connecting the circles with the arrowhead marker
                self.svg
                    .append('path')
                    .attr('d', pathData)
                    .attr('stroke', 'red')
                    .attr('stroke-width', 0.5)
                    .attr('opacity', 0.4)
                    .attr('fill', 'none')
                    .attr('marker-end', 'url(#arrowhead)') // Use the arrowhead marker
                    .attr('class', 'connection-line');
            }
        }
    });
},


        calcCoordinates() {
            const coordinates = this.data.reduce(
                (acc, building) => acc.concat(building.location),
                []
            );

            const xValues = coordinates.map((coord) => parseFloat(coord.x));
            const yValues = coordinates.map((coord) => parseFloat(coord.y));

            const minX = Math.min(...xValues);
            const maxX = Math.max(...xValues);
            const minY = Math.min(...yValues);
            const maxY = Math.max(...yValues);

            this.xScale = d3.scaleLinear().domain([minX, maxX]).range([0, this.width]);
            this.yScale = d3.scaleLinear().domain([minY, maxY]).range([this.height, 0]);
        },

        drawBuildings() {
            const self = this;

            const buildings = this.svg
                .selectAll(".building-group")
                .data(this.data)
                .enter()
                .append("g")
                .attr("class", "building-group");

            // Draw Polygons
            buildings
                .append("polygon")
                .attr("points", (building) =>
                    building.location
                        ? building.location
                            .map(
                                (coord) =>
                                    `${self.xScale(
                                        parseFloat(coord.x)
                                    )},${self.yScale(parseFloat(coord.y))}`
                            )
                            .join(" ")
                        : ""
                )
                .attr("id", (building) => building.buildingId)
                .attr("stroke", "black")
                .attr("stroke-width", 0.18)
                .attr("fill", (building) => {
                    const buildingType = building.buildingType.toLowerCase();
                    const checkIndex = self.checks.findIndex(
                        (check) => check.value.toLowerCase() === buildingType
                    );
                    const isActive =
                        checkIndex !== -1 ? self.checks[checkIndex].active : false;
                    return isActive
                        ? buildingsColors[buildingType].color
                        : "#f6f6f6";
                });

            // Draw Circles
            buildings.each(function (building) {
                const location = building.location ? building.location : null;

                if (location) {
                    // Calculate the perimeter points
                    const perimeterPoints = location.map((coord) => ({
                        x: self.xScale(parseFloat(coord.x)),
                        y: self.yScale(parseFloat(coord.y)),
                    }));

                    // Calculate the average angle between consecutive perimeter points
                    const angles = [];
                    for (let i = 0; i < perimeterPoints.length; i++) {
                        const p1 = perimeterPoints[i];
                        const p2 = perimeterPoints[(i + 1) % perimeterPoints.length];
                        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                        angles.push(angle);
                    }

                    // Create a group for circles
                    const circleGroup = d3.select(this).append("g").attr("class", "circle-group");

                    // Draw circles along the perimeter with different coordinates
                    const circleRadius = 0.5; // Adjust the radius as needed
                    const circleSpacing = 1; // Adjust the spacing between circles as needed
                    const units = building.units || []

                    for (let i = 0; i < units.length; i += circleSpacing) {
                        const index = i % perimeterPoints.length;
                        const angle = angles[index];
                        const cx = perimeterPoints[index].x + Math.cos(angle) * circleSpacing;
                        const cy = perimeterPoints[index].y + Math.sin(angle) * circleSpacing;

                        circleGroup
                            .append("circle")
                            .attr("cx", cx)
                            .attr("cy", cy)
                            .attr("r", circleRadius)
                            .attr("fill", '#333')
                            .attr("class", "perimeter-circle") // Add a class for easier selection
                            .attr("id", (building) => 'place-' + (building.units[i].id))
                            .attr('data-type', (building) => (building.units[i].type))
                            .on("click", function (event, building) {
                                const tooltip = self.$refs.tooltip;
                                const clickedCircle = d3.select(this);

                                // Hide the tooltip and remove the border if clicking the same circle
                                tooltip.style.display = "none";
                                self.selectedBuilding = null;

                                // Remove the border from the clicked circle
                                clickedCircle.style("stroke", null)
                                    .style("stroke-width", null);
                                // Remove the border from all circles
                                d3.selectAll(".perimeter-circle")
                                    .style("stroke", null)
                                    .style("stroke-width", null);

                                // Hide the tooltip if it's visible
                                tooltip.style.display = "none";

                                // Show the tooltip above the circle
                                self.tooltip.type = building.units[i].type;
                                self.tooltip.id = building.units[i].id;
                                tooltip.style.left = event.pageX + "px";
                                tooltip.style.top = event.pageY - 80 + "px"; // Adjust the offset as needed
                                tooltip.style.display = "block";
                                self.selectedBuilding = building;

                                // Add a yellow border to the clicked circle
                                clickedCircle.style("stroke", "orange")
                                    .style("stroke-width", 0.3);

                                self.$emit('mapPlace', building.units[i].id);

                            });

                    }
                }
            });
            self.svg.selectAll(".circle-group").raise();
            self.svg.selectAll(".perimeter-circle").raise();
        },

        handleZoom(event) {
            const { transform } = event;
            this.svg.selectAll(".building-group").attr("transform", transform);
            this.svg.selectAll(".connection-line").attr("transform", transform);
            this.svg.selectAll(".start-triangle").attr("transform", transform);
            this.svg.selectAll(".end-triangle").attr("transform", transform);
            this.$refs.tooltip.style.display = "none";
        },

        zoomIn() {
            this.svg.transition().call(this.zoom.scaleBy, 1.2);
        },

        zoomOut() {
            this.svg.transition().call(this.zoom.scaleBy, 0.8);
        },

        resetZoom() {
            this.svg.transition().call(this.zoom.transform, d3.zoomIdentity);
        },

        handleCheckChange(index, isActive) {
            this.checks[index].active = isActive;
        },
    },
};
</script>
<style scoped>
.tooltip {
    position: absolute;
    background-color: rgba(255, 255, 255, 0.9);
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    z-index: 1000;
}

.connection-line {
    z-index: -1;
}

.pathCircle {
    position: relative;
    z-index: 99999;
}
</style>