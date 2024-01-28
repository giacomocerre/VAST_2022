<template>
    <title-component :text="title" :icon="{ icon: 'check', width: 'w-6' }" />
    <button-component text="Reset Parameters" icon="reset" @clicked="handleReset" class="top-20" />
    <div class=" grid grid-cols-6 gap-4">
        <div class="bg-white rounded-lg shadow mt-10 pr-5 pl-5 pb-5 col-span-4 relative">
            <div class="overflow-hidden w-fit bg-gray-100 block align-middle mb-3 mt-5 rounded-full">
                <options-component class="float-left" v-for="(filter, index) in placeTypeFilters" :value="filter"
                    :index="index" :key="index" @option-selected="filterChange"
                    :classes="'capitalize cursor-pointer select-none rounded-full p-1 pl-3 pr-3 text-center text-xs peer-checked:bg-blue-400 peer-checked:font-bold peer-checked:text-white'" />
            </div>
            <div class="absolute top-3 right-5">
                <span @click="changeSorting('desc-es','total')" :class="{ 'bg-blue-400 text-white font-bold': sort === 'desc-es' }"
                    class="py-2 px-4 inline-flex items-center mt-2 ml-4 bg-[#f6f6f6] border-l-1 pr-5 rounded-full cursor-pointer">
                    <svg-icon icon="descendSort" class="mr-3 w-3" />
                    <span class="text-xs">Descending {{ placeTypeFiltersActive === 'employer' ? 'Salaries' : 'Earnings' }}</span>
                </span>
                <span @click="changeSorting('asc-es','total')" :class="{ 'bg-blue-400 text-white font-bold': sort === 'asc-es' }"
                    class="py-2 px-4 inline-flex items-center mt-2 ml-4 bg-[#f6f6f6] border-l-1 pr-5 rounded-full cursor-pointer">
                    <svg-icon icon="ascendSort" class="mr-3 w-3" />
                    <span class="text-xs">Ascending {{ placeTypeFiltersActive === 'employer' ? 'Salaries' : 'Earnings' }}</span>
                </span>
                <span @click="changeSorting('asc-at','percentageChangeIndex')" :class="{ 'bg-blue-400 text-white font-bold': sort === 'asc-at' }"
                    class="py-2 px-4 inline-flex items-center mt-2 ml-4 bg-[#f6f6f6] border-l-1 pr-5 rounded-full cursor-pointer">
                    <svg-icon icon="descendSort" class="mr-3 w-3" />
                    <span class="text-xs">Descending {{ placeTypeFiltersActive === 'employer' ? 'Turnover' : 'Affluence' }}</span>
                </span>
                <span @click="changeSorting('desc-at', 'percentageChangeIndex')" :class="{ 'bg-blue-400 text-white font-bold': sort === 'desc-at' }"
                    class="py-2 px-4 inline-flex items-center mt-2 ml-4 bg-[#f6f6f6] border-l-1 pr-5 rounded-full cursor-pointer">
                    <svg-icon icon="ascendSort" class="mr-3 w-3" />
                    <span class="text-xs">Ascending {{ placeTypeFiltersActive === 'employer' ? 'Turnover' : 'Affluence' }}</span>
                </span>
            </div>
            <period-places-activity :data="period" :loading="loading" :current="placeTypeFiltersActive"
                @selected-place-data="handlerSelectedPalceMonth" />
        </div>
        <div class="bg-white rounded-lg shadow mt-10 pr-5 pl-5 pb-5 col-span-2 w-full h-fit">
            <period-specifics v-if="!selectedPlace" :data="overallPeriod" :loading="loading" />
            <period-place-selected v-if="selectedPlace" :data="{history, dataPlace}" :selectedPlace="selectedPlace" :loading="placeLoading" />
        </div>
    </div>
</template>
<script>
import TitleComponent from '../../components/atoms/TitleComponent.vue'
import { fetchPeriods } from '@/api/Businesses';
import { fetchPlace } from '@/api/Buildings';
import SvgIcon from '@/components/atoms/SvgIcon.vue';
import OptionsComponent from '@/components/OptionsComponent.vue';
import PeriodPlacesActivity from '@/components/widgets/PeriodPlacesActivity.vue';
import PeriodSpecifics from '@/components/widgets/PeriodSpecifics.vue';
import PeriodPlaceSelected from '@/components/widgets/PeriodPlaceSelected.vue';
import ButtonComponent from '@/components/atoms/ButtonComponent.vue';

export default {
    components: { TitleComponent, SvgIcon, OptionsComponent, PeriodPlacesActivity, PeriodSpecifics, PeriodPlaceSelected, ButtonComponent },
    props: {
        title: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            loading: true,
            placeLoading:true,
            period: [],
            history: [],
            overallPeriod: [],
            placeTypeFilters: ['activities', 'pub', 'restaurant', 'employer'],
            placeTypeFiltersActive: 'activities',
            sort: 'desc-es',
            sortType: 'total',
            selectedPlace: null,
            dataPlace: null,
        }
    },
    created() {
        this.fetchData();
    },
    watch: {
        placeTypeFiltersActive: {
            handler: "fetchData",
            immediate: true,
        },
        sort: {
            handler: "fetchData",
            immediate: true,
        },
        sortType: {
            handler: "fetchData",
            immediate: true,  
        },
        selectedPlace: {
            handler: "fetchPlaceData",
        },
    },
    methods: {
        async fetchData() {
            this.loading = true;
            this.period = this.orderBy(this.sortType, this.sort, await fetchPeriods(this.placeTypeFiltersActive))
            this.overallPeriod = this.calcOverall(await fetchPeriods(this.placeTypeFiltersActive))

            this.loading = false;
        },
        async fetchPlaceData() {
            this.placeLoading = true;
            if (this.selectedPlace) {
                const { type, place, month } = this.selectedPlace;
                this.history = await fetchPeriods(type, month, place)
                this.dataPlace = await fetchPlace(place);
            }
            this.placeLoading = false;
        },
        calcOverall(period) {
            const calculateAverage = (array, field) => {
                const sum = array.reduce((acc, obj) => acc + obj[field], 0);
                return array.length > 0 ? sum / array.length : 0;
            };

            const getUser = (data, order, total) => {
                const userOccurrences = {};
                const placeIdsWithUser = {};

                // Iteriamo sull'array e popoliamo gli oggetti delle occorrenze e dei placeId unici
                data.forEach(place => {
                    place.monthlyIndexes.forEach(monthlyIndex => {
                        monthlyIndex.current.forEach(user => {
                            userOccurrences[user] = (userOccurrences[user] || 0) + 1;

                            if (!placeIdsWithUser[user]) {
                                placeIdsWithUser[user] = new Set();
                            }

                            placeIdsWithUser[user].add(place.placeId);
                        });
                    });
                });
                const user = order === 'best'
                    ? Object.keys(userOccurrences).reduce((a, b) => userOccurrences[a] > userOccurrences[b] ? a : b)
                    : Object.keys(userOccurrences).reduce((a, b) => userOccurrences[a] < userOccurrences[b] ? a : b);

                
                const uniquePlaceIdsWithMaxUser = [...placeIdsWithUser[user]];

                return { participantId: user, frequency: uniquePlaceIdsWithMaxUser.length, percentage: (uniquePlaceIdsWithMaxUser.length / total) * 100 }
            }

            const getPlace = (data, order, total) => {
                const placeUsers = {};

                data.forEach((place) => {
                    // Itero attraverso i dati mensili di ogni posto
                    place.monthlyIndexes.forEach((monthlyData) => {
                        // Aggiungo gli ID utente all'oggetto placeUsers per ogni posto
                        if (!placeUsers[place.placeId]) {
                            placeUsers[place.placeId] = new Set();
                        }
                        monthlyData.current.forEach((userId) => {
                            placeUsers[place.placeId].add(userId);
                        });
                    });
                });


                const place = order === 'best'
                    ? Object.entries(placeUsers).reduce((max, [placeId, usersSet]) => {
                        const frequency = usersSet.size;
                        return frequency > max.frequency ? { placeId, frequency } : max;
                    }, { placeId: null, frequency: -1, percentage: null })
                    : Object.entries(placeUsers).reduce((min, [placeId, usersSet]) => {
                        const frequency = usersSet.size;
                        if (min.frequency === -1 || frequency < min.frequency) {
                            min = { placeId, frequency, percentage: null };
                        }
                        return min;
                    }, { placeId: null, frequency: -1, percentage: null });


                return { placeId: place.placeId, frequency: place.frequency, percentage: (place.frequency/total)*100 };
            }

            const transformedData = [];
            const typesSet = new Set();

            period.forEach(item => {
                if (!typesSet.has(item.type)) {
                    typesSet.add(item.type);

                    const filteredItems = period.filter(i => i.type === item.type);

                    transformedData.push({
                        type: item.type,
                        numbers: filteredItems.length,
                        percentageChangeIndex: 0,
                        bestParticipant: getUser(filteredItems, 'best', filteredItems.length),
                        worstParticipant: getUser(filteredItems, 'worst', filteredItems.length),
                        bestPlace: getPlace(filteredItems, 'best', 1011),
                        worstPlace: getPlace(filteredItems, 'worst', 1011),
                        total: 0,
                        monthlyIndexes: item.monthlyIndexes.map(monthItem => {
                            const filteredMonthItems = filteredItems
                                .filter(i => i.monthlyIndexes.find(mi => mi.month === monthItem.month))
                                .map(fi => fi.monthlyIndexes.find(mi => mi.month === monthItem.month));

                            return {
                                month: monthItem.month,
                                percentageChangeIndex: calculateAverage(filteredMonthItems, 'percentageChangeIndex'),
                                total: calculateAverage(filteredMonthItems, 'total')
                            };
                        })
                    });
                }
            });

            transformedData.map(d => {
                d.percentageChangeIndex = calculateAverage(d.monthlyIndexes, 'percentageChangeIndex')
                d.total = calculateAverage(d.monthlyIndexes, 'total')
            })
            return transformedData
        },

        filterChange(filter) {
            this.placeTypeFiltersActive = filter;
        },

        orderBy(orderKey, order, data, sortType) {
            const calculateAverage = (monthlyIndexes) => {
                const sum = sortType === 'total' 
                    ? monthlyIndexes.reduce((total, month) => total + month[orderKey], 0)
                    : monthlyIndexes.reduce((percentageChangeIndex, month) => percentageChangeIndex + month[orderKey], 0) ;
                return sum;
            };

            // Ordina gli oggetti in base alla media in ordine decrescente
            return data.sort((a, b) => order.split('-')[0] === 'desc' ? calculateAverage(b.monthlyIndexes) - calculateAverage(a.monthlyIndexes) : calculateAverage(a.monthlyIndexes) - calculateAverage(b.monthlyIndexes));
        },
        changeSorting(sort, sortType) {
            this.sortType = sortType
            this.sort = sort
        },
        handlerSelectedPalceMonth(handler) {
            const { type, place, month } = handler;
            this.selectedPlace = {
                type,
                place,
                month
            }
        },
        handleReset() {
            this.selectedPlace = null
        }

    },

}
</script>