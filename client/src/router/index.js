import { createRouter, createWebHistory } from 'vue-router'
import HomeView from  '../views/HomeView.vue'
import DashboardView from '../views/DashboardView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/dashboard',
    name: 'dashboardMain',
    component: DashboardView
  },
  {
    path: '/dashboard/overview',
    name: 'dashboard',
    component: DashboardView
  }
]

const router = createRouter({
  history: createWebHistory(''),
  routes
})

export default router
