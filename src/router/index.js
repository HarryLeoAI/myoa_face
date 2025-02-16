import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView from '@/views/login/LoginView.vue'
import FrameView from '@/views/main/FrameView.vue'
import MyAbsent from '@/views/absent/MyAbsent.vue'
import SubAbent from '@/views/absent/SubAbent.vue'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'frame',
      component: FrameView,
      children: [
        {
          path: 'absent/my',
          name: 'myabsent',
          component: MyAbsent,
        },
        {
          path: 'absent/sub',
          name: 'subabsent',
          component: SubAbent,
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
  ],
})

// 全局导航守卫
router.beforeEach((to) => {
  // 判断用户是否登录, 如果没有登录, 则强行跳转到登录页面
  const authStore = useAuthStore()
  if (!authStore.is_logined && to.name != 'login') {
    ElMessage.error('请先登录!')
    return { name: 'login' }
  }
})

export default router
