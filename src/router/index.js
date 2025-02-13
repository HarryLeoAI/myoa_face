import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView from '@/views/login/LoginView.vue'
import FrameView from '@/views/main/FrameView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'frame',
      component: FrameView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
  ],
})

export default router
