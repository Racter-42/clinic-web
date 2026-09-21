import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Layout from '../views/Layout.vue'
import DoctorList from '../views/doctor/DoctorList.vue'
import ScheduleList from '../views/schedule/ScheduleList.vue'
import ReservePage from '../views/source/ReservePage.vue'
import ReserveList from '../views/reserve/ReserveList.vue'
import RecommendPage from '../views/recommend/RecommendPage.vue'

// 路由表：登录页是独立的；其余页面都套在 Layout（左侧菜单 + 顶栏）里面
const routes = [
  { path: '/login', component: Login },
  {
    path: '/',
    component: Layout,
    redirect: '/doctor', // 登录后默认落在医生管理页
    children: [
      { path: 'doctor', component: DoctorList },
      { path: 'schedule', component: ScheduleList },
      { path: 'reserve', component: ReservePage },
      { path: 'records', component: ReserveList },
      { path: 'recommend', component: RecommendPage }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(), // history 模式：地址栏不带 #
  routes
})

// 全局守卫：每次跳页面前检查登录态
router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (!token && to.path !== '/login') return '/login' // 没登录想去别的页 → 赶回登录页
  if (token && to.path === '/login') return '/'       // 已登录还访问登录页 → 直接进首页
})

export default router
