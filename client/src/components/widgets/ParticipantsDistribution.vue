<template>
    <div class="overflow-hidden w-full border-b-2">
        <div class="relative">
            <title-component :text="title.text" :subtitle="title.subtitle" subtitleClasses="font text-sm"
                titleClasses="relative mt-5 flex items-center text-xl dark:text-gray-600 font-bold capitalize" />
            <div class="overflow-hidden absolute top-2 right-2">
                <span @click="changeSorting('participant')"
                    :class="{ 'bg-blue-400 text-white font-bold': sort === 'participant' }"
                    class="py-2 px-4 inline-flex items-center mt-2 ml-4 bg-[#f6f6f6] border-l-1 pr-5 rounded-full cursor-pointer">   
                    <svg-icon icon="idSort" class="mr-3 w-3" />
                    <span class="text-xs">Sort by Participant</span>
                </span>
                <span @click="changeSorting('amount')"
                    :class="{ 'bg-blue-400 text-white font-bold': sort === 'amount' }"
                    class="py-2 px-4 inline-flex items-center mt-2 ml-4 bg-[#f6f6f6] border-l-1 pr-5 rounded-full cursor-pointer">   
                    <svg-icon icon="descendSort" class="mr-3 w-3" />
                    <span class="text-xs">Sort by Amount</span>
                </span>
            </div>
        </div>
        <div class="bg-white w-full pt-5 pb-5 overflow-hidden">
            <loading-box v-if="loading" :content="'Loading Participants Lists...'"/>
            <div v-if="!loading">
                <div v-for="participant in data" :key="participant.participantId"
                    class="float-left overflow-hidden m-0.5 w-2.5 rounded participant-item"
                    :style="{ 'width': '0.530rem', 'height': '0.530rem', 'backgroundColor': setColor(participant.value) }"
                    :class="{ 'border-2 border-orange-500': selectedParticipant === participant.participantId }"
                    @mouseenter="showTooltip(participant.value, participant.participantId)"
                    @mouseleave="hideTooltip"
                    @mousemove="updateTooltipPosition"
                    @click="setParticipant(participant.participantId)">
                    <tool-tip v-if="tooltip.visible && tooltip.type === participant.participantId" :style="tooltip.style"
                        :title="'Participant'" :value="tooltip.value.toFixed(2) + (filter === 'saving' ? '%' : '$')" :tags="tags"
                        :extra="tooltip.extra" />
                </div>
            </div>
        </div>
    </div>
</template>
  
<script>
import * as d3 from 'd3';
import ToolTip from '../atoms/ToolTip.vue';
import TitleComponent from '../atoms/TitleComponent.vue';
import LoadingBox from '../atoms/LoadingBox.vue';
import SvgIcon from '../atoms/SvgIcon.vue';

export default {
    components: { ToolTip, TitleComponent, LoadingBox, SvgIcon },
    props: {
        data: { type: Object, require: true },
        filter: { type: String, require: true },
        inverse: { type: Boolean, require: true },
        date: { type: String, require: true },
        loading: { type: Boolean, default: false },
    },
    data() {
        return {
            tooltip: {
                visible: false,
                value: 'No Value',
                type: 'No Type',
                extra: 'No Extra',
                style: { top: '0', left: '0' },
            },
            tags: ['participants', 'wage'],
            title: { text: "", subtitle: "" },
            sort: 'participant',
            selectedParticipant: null,
        };
    },
    watch: {
        filter: {
            handler: 'setTitle',
            immediate: true,
        },
        date: {
            handler: 'setTitle',
            immediate: true,
        },
    },
    computed: {
        colorScale() {
            const { minValue, maxValue } = this.calculateMinMaxValues();
            return d3.scaleLinear()
                .domain([minValue, maxValue])
                .range(this.inverse ? ['#FF664F', '#FFD2C4'] : ['#D6F2BB', '#456E47'])
                .nice()
        },
    },
    methods: {
        calculateMinMaxValues() {
            return this.data.reduce((acc, curr) => {
                acc.minValue = Math.min(acc.minValue, curr.value);
                acc.maxValue = Math.max(acc.maxValue, curr.value);
                return acc;
            }, { minValue: Infinity, maxValue: -Infinity });
        },

        setTitle() {
            this.title = {
                text: `Participants ${this.filter} Distribution - ${this.date}`,
                subtitle: `Analyzing the distribution of ${this.filter} ${this.filter !== 'wage' && this.filter !== 'saving' ? 'expenses' : ''} values across participants`
            };
        },

        setColor(index) {
            if (index === 0) {
                return '#ccc';
            }
            return this.inverse ? this.colorScale(index) : (index < 0 ? '#FF664F' : this.colorScale(index));
        },
        showTooltip(value, type) {
            this.tooltip = {
                visible: true,
                type,
                value,
                extra: type,
            };

            this.tags = ['participant', this.filter];
        },
        hideTooltip() {
            this.tooltip.visible = false;
        },
        updateTooltipPosition(event) {
            if (this.tooltip.visible) {
                const scrollY = window.scrollY || window.pageYOffset;
                const scrollX = window.scrollX || window.pageXOffset;

                this.tooltip.style = {
                    top: `${event.clientY + scrollY + 5}px`,
                    left: `${event.clientX + scrollX + 5}px`,
                };
            }
        },
        changeSorting(sort) {
            this.sort = sort;
            this.$emit("changeSort", sort);
        },
        setParticipant(participant) {
            // Remove the active-item class from all participants
            const participants = document.querySelectorAll('.participant-item');
            participants.forEach((element) => {
                element.classList.remove('active-item');
            });

            // Add the active-item class to the clicked participant
            this.selectedParticipant = participant;
            this.$emit("changeParticipant", participant);
        }
    }
};
</script>
<style scoped>
.active-item {
    border: 2px inset #333;
}
</style>
