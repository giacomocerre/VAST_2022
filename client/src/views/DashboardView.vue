<template>
  <div class="flex bg-gray-100 text-gray-900">
    <aside
      class="flex z-50 h-screen w-20 flex-col items-center border-r border-gray-200 bg-white fixed"
    >
      <sidebar-component @changeDashboardView="changeView" />
    </aside>
    <!-- component -->
    <section class="main-dashboard-content w-full">
      <div class="text-left w-full">
        <breadcrumbs-component :current="currentView" />
        <div>
          <overview-view v-if="currentView === 'overview'" :title="viewTitle" />
          <user-view v-if="currentView === 'user'" :title="viewTitle" />
          <business-view v-if="currentView === 'city'" :title="viewTitle" />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import BreadcrumbsComponent from "@/components/BreadcrumbsComponent.vue";
import SidebarComponent from "../components/SidebarComponent.vue";
import { VIEWS } from "../config/config.js";
import OverviewView from "./dashboard/OverviewView.vue";
import UserView from "./dashboard/UserView.vue";
import BusinessView from "./dashboard/BusinessView.vue";

export default {
  components: {
    SidebarComponent,
    BreadcrumbsComponent,
    OverviewView,
    UserView,
    BusinessView,
  },
  data() {
    return {
      currentView: VIEWS["overview"].path,
      viewTitle: VIEWS["overview"].name,
    };
  },
  methods: {
    changeView(view) {
      this.currentView = view;
      this.viewTitle = VIEWS[view].name || "";
    },
  },
};
</script>
<style>
.main-dashboard-content {
  padding: 20px 40px 20px 110px;
  min-height: 100vh;
}
</style>
