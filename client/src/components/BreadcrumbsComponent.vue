<template>
    <nav class="flex mb-4" aria-label="Breadcrumb">
        <ol class="inline-flex items-center space-x-1 md:space-x-3 rtl:space-x-reverse">
            <li class="inline-flex items-center">
                <router-link to="/"
                    class="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
                    <SvgIcon icon="home"/>
                </router-link>
            </li>
            <li>
                <div class="flex items-center">
                    <svg class="w-3 h-3 text-gray-500 mx-1 rtl:rotate-180" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                            d="m1 9 4-4-4-4" />
                    </svg>
                    <router-link to="/dashboard"
                        class="ms-1 text-sm font-medium text-gray-500 hover:text-blue-600 md:ms-2 dark:text-gray-500 dark:hover:text-gray-900">Dashboard</router-link>
                </div>
            </li>
            <li aria-current="page">
                <div class="flex items-center">
                    <svg class="w-3 h-3 text-gray-400 mx-1 rtl:rotate-180" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                            d="m1 9 4-4-4-4" />
                    </svg>
                    <span class="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-900 cursor-pointer">{{currentView}}</span>
                </div>
            </li>
        </ol>
    </nav>
</template>
<script>

import SvgIcon from './atoms/SvgIcon.vue';
import { VIEWS } from "../config/config.js"

export default {
    components: { SvgIcon },
    props: {
        current: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            currentView: VIEWS[this.current].breadcrumbs || '',
        };
    },
    watch: {
        current(newValue) {
            this.currentView = VIEWS[newValue].breadcrumbs || '';
        },
    },
}
</script>