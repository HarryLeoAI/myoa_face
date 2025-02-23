import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import LoginView from '@/views/login/LoginView.vue'
import FrameView from '@/views/main/FrameView.vue'
import MyAbsent from '@/views/absent/MyAbsent.vue'
import SubAbent from '@/views/absent/SubAbent.vue'
import CreateInform from '@/views/inform/CreateInform.vue'
import InformList from '@/views/inform/InformList.vue'
import InformDetail from '@/views/inform/InformDetail.vue'
import CreateStaff from '@/views/staff/CreateStaff.vue'
import StaffList from '@/views/staff/StaffList.vue'

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
        {
          path: 'inform/create',
          name: 'createinform',
          component: CreateInform,
        },
        {
          path: 'inform/list',
          name: 'informlist',
          component: InformList,
        },
        {
          path: 'inform/detail/:pk',
          name: 'informdetail',
          component: InformDetail,
        },
        {
          path: 'staff/create',
          name: 'createstaff',
          component: CreateStaff,
        },
        {
          path: 'staff/list',
          name: 'stafflist',
          component: StaffList,
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
