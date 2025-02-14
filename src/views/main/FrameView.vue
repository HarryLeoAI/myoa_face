<script setup name="frame">
import { ref } from 'vue'
import { Expand, Fold, ArrowDown, UserFilled } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'

let authStore = useAuthStore()
let router = useRouter()
let isCollapse = ref(false)

// 侧边栏开关
const toggleAside = () => {
  isCollapse.value = !isCollapse.value
}

// 退出登录
const logout = () => {
  ElMessageBox.confirm('即将退出登录,是否确认?', '确认退出?', {
    confirmButtonText: '确认退出',
    cancelButtonText: '点错了,返回',
    type: 'warning',
  })
    .then(() => {
      authStore.clearUserToken()
      router.push({ name: 'login' })
    })
    .catch(() => {
      return false
    })
}
</script>

<template>
  <el-container class="container">
    <!-- 侧边栏 -->
    <el-menu
      active-text-color="skyblue"
      background-color="#2b369c"
      class="el-menu-vertical-demo"
      :collapse="isCollapse"
      default-active="1"
      text-color="#fff"
    >
      <el-menu-item index="1" class="brand">
        <el-icon><HomeFilled /></el-icon>
        <span>MyOA</span>
      </el-menu-item>

      <el-sub-menu index="2">
        <template #title>
          <el-icon><Checked /></el-icon>
          <span>考勤管理</span>
        </template>
        <el-menu-item index="2-1">
          <el-icon><Avatar /></el-icon>
          <span>个人考勤</span>
        </el-menu-item>
        <el-menu-item index="2-2">
          <el-icon><Finished /></el-icon>
          <span>下属考勤</span>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="3">
        <template #title>
          <el-icon><BellFilled /></el-icon>
          <span>通知管理</span>
        </template>
        <el-menu-item index="3-1">
          <el-icon><Phone /></el-icon>
          <span>发布通知</span>
        </el-menu-item>
        <el-menu-item index="3-2">
          <el-icon><List /></el-icon>
          <span>通知列表</span>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="4">
        <template #title>
          <el-icon><UserFilled /></el-icon>
          <span>员工管理</span>
        </template>
        <el-menu-item index="4-1">
          <el-icon><CirclePlusFilled /></el-icon>
          <span>新增员工</span>
        </el-menu-item>
        <el-menu-item index="4-2">
          <el-icon><Memo /></el-icon>
          <span>员工列表</span>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>

    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="left-header">
          <el-button v-show="isCollapse" @click="toggleAside">
            <strong>展开</strong>
            <el-icon><Expand /></el-icon>
          </el-button>
          <el-button v-show="!isCollapse" @click="toggleAside">
            <el-icon><Fold /></el-icon>
            <strong>折叠</strong>
          </el-button>
        </div>
        <div class="right-header">
          <el-dropdown>
            <span class="el-dropdown-link">
              <el-avatar :icon="UserFilled" :size="30" style="margin-right: 8px"></el-avatar>
              <span>
                {{ authStore.user.realname }}-({{ authStore.user.department.name }})
                <el-icon class="el-icon--right">
                  <arrow-down />
                </el-icon>
              </span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>修改密码</el-dropdown-item>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <!-- 具体内容 -->
      <el-main class="main">Main</el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.container {
  height: 100vh;
  background-color: #edeff1;
}
.brand {
  background-color: #1d2151;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  height: 66px;
}
.header {
  background-color: #fff;
  height: 66px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.el-menu {
  border-right: none;
}
.el-dropdown-link {
  display: flex;
  align-items: center;
}
</style>
