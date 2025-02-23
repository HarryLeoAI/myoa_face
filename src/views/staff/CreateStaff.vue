<script setup>
import OAMain from '@/components/OAMain.vue'
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

/**
 * 判断当前用户是否有权限新增员工
 */
const isLeader = () => {
  if (authStore.user.department.leader == authStore.user.uid) {
    return true
  }

  return false
}

/**
 * 初始化表单
 */
let createStaffForm = ref()
let createStaffFormData = reactive({
  realname: '',
  email: '',
  telphone: '',
})
let department = authStore.user.department.name
// 验证规则
let createStaffFormRules = reactive({
  realname: [
    { required: true, message: '必须填写真实姓名!' },
    { max: 10, min: 2, message: '必须填写正确的真名, 最少2个字!' },
  ],
  email: [
    { required: true, message: '必须填写电子邮箱!' },
    { min: 7, max: 30, message: '请务必填写正确的邮箱地址!' },
  ],
  telphone: [
    { required: true, message: '必须填写联系电话!' },
    { min: 11, max: 11, message: '请务必填写正确的联系电话(11位)!' },
  ],
})

/**
 * 重置表单
 */
const resetForm = () => {
  createStaffFormData.realname = ''
  createStaffFormData.email = ''
  createStaffFormData.telphone = ''
}

/**
 * 提交表单
 */
const onSubmit = () => {
  createStaffForm.value.validate((valid, fields) => {
    if (valid) {
      // 验证邮箱格式
      let emailRgx = /^([a-zA-Z0-9._-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9])+/
      if (!emailRgx.test(createStaffFormData.email)) {
        ElMessage.error('邮箱格式不正确! 请检查.')
        return false
      }
      console.log(createStaffFormData)
    } else {
      for (let key in fields) {
        ElMessage.error(fields[key][0]['message'])
      }
      return false
    }
  })
}
</script>

<template>
  <OAMain title="新增员工">
    <el-card style="width: 1000px">
      <template #header>
        <h1 style="text-align: center">新增员工</h1>
      </template>
      <el-form
        :model="createStaffFormData"
        :rules="createStaffFormRules"
        ref="createStaffForm"
        :label-width="100"
      >
        <el-form-item label="所属部门" prop="department">
          <el-input type="text" v-model="department" disabled />
        </el-form-item>
        <el-form-item label="电子邮箱" prop="email">
          <el-input
            type="email"
            v-model="createStaffFormData.email"
            placeholder="电子邮箱将作为员工登录本OA系统的账号,请务必填写正确!"
          />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realname">
          <el-input type="text" v-model="createStaffFormData.realname" />
        </el-form-item>
        <el-form-item label="联系电话" prop="telphone">
          <el-input type="text" v-model="createStaffFormData.telphone" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="footer-box">
          <div>
            <el-tooltip
              content="注意: 仅本部直接领导有权为所部新增员工!"
              placement="right"
              effect="dark"
            >
              <span>
                您是否有权为 [{{ authStore.user.department.name }}] 新增员工?
                {{ isLeader() ? '是!' : '否!' }}
              </span>
            </el-tooltip>
          </div>
          <div>
            <el-button type="danger" @click="resetForm"> 重置表单 </el-button>
            <el-button type="success" @click="onSubmit"> 新增员工 </el-button>
          </div>
        </div>
      </template>
    </el-card>
  </OAMain>
</template>

<style scoped>
.footer-box {
  display: flex;
  justify-content: space-between;
}
</style>
