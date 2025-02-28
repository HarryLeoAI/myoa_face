<script setup name="frame">
import { ref, reactive } from 'vue'
import { Expand, Fold } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import authHttp from '@/api/authHttp'
import OADialog from '@/components/OADialog.vue'

let authStore = useAuthStore()
let router = useRouter()

/**
 * 侧边栏开关
 */
let isCollapse = ref(false)

const toggleAside = () => {
  isCollapse.value = !isCollapse.value
}

/**
 * 退出登录
 */
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

/**
 * 密码修改
 */
let dialogFormVisible = ref(false)
let resetPasswordForm = ref()

const resetPasswordFormData = reactive({
  user: authStore.user,
  old_password: '',
  new_password: '',
  check_new_password: '',
})

const toggleResetPasswordForm = () => {
  resetPasswordFormData.old_password = ''
  resetPasswordFormData.new_password = ''
  resetPasswordFormData.check_new_password = ''
  dialogFormVisible.value = true
}

let resetPasswordFormRules = reactive({
  old_password: [
    { required: true, message: '必须填写旧密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度必须在6~30位之间', trigger: 'blur' },
  ],

  new_password: [
    { required: true, message: '必须填写旧密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度必须在6~30位之间', trigger: 'blur' },
  ],

  check_new_password: [
    { required: true, message: '必须填写旧密码', trigger: 'blur' },
    { min: 6, max: 30, message: '密码长度必须在6~30位之间', trigger: 'blur' },
  ],
})

const resetPassword = async () => {
  resetPasswordForm.value.validate(async (valid) => {
    if (valid) {
      try {
        await authHttp.resetPassword(
          resetPasswordFormData.new_password,
          resetPasswordFormData.old_password,
          resetPasswordFormData.check_new_password,
        )
        ElMessage.success('密码修改成功!')
        dialogFormVisible.value = false
      } catch (detail) {
        ElMessage.error(detail)
      }
    } else {
      ElMessage.error('密码长度错误!')
      return false
    }
  })
}
/**
 * 密码修改代码块结束
 */
</script>

<template>
  <!-- 主体 -->
  <el-container class="container">
    <!-- 侧边栏 -->
    <el-menu
      active-text-color="skyblue"
      background-color="#2b369c"
      class="el-menu-vertical-demo"
      :collapse="isCollapse"
      default-active="1"
      text-color="#fff"
      :router="true"
    >
      <el-menu-item class="brand">
        <router-link :to="{ name: 'frame' }" class="brand-text"
          ><el-icon><HomeFilled /> </el-icon>
        </router-link>
        <span>
          <router-link :to="{ name: 'frame' }" class="brand-text"> MyOA</router-link>
        </span>
      </el-menu-item>

      <el-sub-menu index="1">
        <template #title>
          <el-icon><Checked /></el-icon>
          <span>考勤管理</span>
        </template>
        <el-menu-item index="1-1" :route="{ name: 'myabsent' }">
          <el-icon><Avatar /></el-icon>
          <span>个人考勤</span>
        </el-menu-item>
        <el-menu-item index="1-2" :route="{ name: 'subabsent' }">
          <el-icon><Finished /></el-icon>
          <span>下属考勤</span>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="2">
        <template #title>
          <el-icon><BellFilled /></el-icon>
          <span>通知管理</span>
        </template>
        <el-menu-item index="2-1" :route="{ name: 'createinform' }">
          <el-icon><Phone /></el-icon>
          <span>发布通知</span>
        </el-menu-item>
        <el-menu-item index="2-2" :route="{ name: 'informlist' }">
          <el-icon><List /></el-icon>
          <span>通知列表</span>
        </el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="3">
        <template #title>
          <el-icon><UserFilled /></el-icon>
          <span>员工管理</span>
        </template>
        <el-menu-item index="3-1" :route="{ name: 'createstaff' }">
          <el-icon><CirclePlusFilled /></el-icon>
          <span>新增员工</span>
        </el-menu-item>
        <el-menu-item index="3-2" :route="{ name: 'stafflist' }">
          <el-icon><Memo /></el-icon>
          <span>员工列表</span>
        </el-menu-item>
        <el-menu-item index="3-3" :route="{ name: 'departmentlist' }">
          <el-icon><Grid /></el-icon>
          <span>部门列表</span>
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
            <el-button>
              <el-icon><UserFilled /></el-icon>
              <span>{{ authStore.user.realname }}</span>
              <span>({{ authStore.user.department.name }})</span>
              <el-icon><ArrowDownBold /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="toggleResetPasswordForm()">修改密码</el-dropdown-item>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <!-- 具体内容 -->
      <el-main class="main">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>

  <!-- 修改密码对话框表单 -->
  <OADialog v-model="dialogFormVisible" title="修改密码" @submit="resetPassword">
    <el-form
      :model="resetPasswordFormData"
      :rules="resetPasswordFormRules"
      ref="resetPasswordForm"
      :label-width="80"
    >
      <el-form-item label="旧密码" prop="old_password">
        <el-input type="password" v-model="resetPasswordFormData.old_password" />
      </el-form-item>
      <el-form-item label="新的密码" prop="new_password">
        <el-input type="password" v-model="resetPasswordFormData.new_password" />
      </el-form-item>
      <el-form-item label="再输一次" prop="check_new_password">
        <el-input type="password" v-model="resetPasswordFormData.check_new_password" />
      </el-form-item>
    </el-form>
  </OADialog>
</template>

<style scoped>
.container {
  height: 100vh;
  background-color: #edeff1;
}
.brand {
  background-color: #1d2151;
  height: 66px;
}
.brand-text {
  text-decoration: none;
  color: white;
  font-size: 18px;
  font-weight: bolder;
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
</style>
