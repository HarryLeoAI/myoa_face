<script setup>
import OAMain from '@/components/OAMain.vue'
import staffHttp from '@/api/staffHttp'
import { ref, onMounted, reactive } from 'vue'
import OADialog from '@/components/OADialog.vue'
import { ElMessage } from 'element-plus'

// 获取数据
let departments = ref([])
let staffs = ref({})
onMounted(async () => {
  try {
    staffs.value = await staffHttp.requestNoPageStaffs()
    departments.value = await staffHttp.getDepartments()
  } catch (error) {
    ElMessage.error(error.detail)
  }
})

// 筛选函数: 传入员工列表, 遍历该列表, 根据器内容字段 .department.id 进行筛选
const filterStaffs = (staffs, department_id) =>
  staffs.filter((staff) => staff?.department?.id === department_id)

// 空的数组, 终于存放待选的领导和分管董事
let leaders = ref([])
let managers = ref([])

// 表单
let dialogFormVisible = ref(false)
let departmentFormData = reactive({
  id: '',
  name: '',
  intro: '',
  leader: {},
  manager: {},
})
const departmentForm = ref()
const departmentFormRules = reactive({
  id: [{ required: true, message: '必须传入部门编号!' }],
  name: [
    { required: true, message: '必须传入部门名称!' },
    { max: 10, min: 2, message: '部门名称在2~10个字之间!' },
  ],
  intro: [
    { required: true, message: '必须传入部门简介!' },
    { min: 2, message: '部门简介最少2个字!' },
  ],
  leader: [{ required: true, message: '必须指定部门领导!' }],
})

// 查看详情
const DepartmentDetail = async (department) => {
  // 先将被循环到的部门数据填充到表单里
  Object.assign(departmentFormData, department)
  // 筛选本部门成员, 作为待选直属领导
  leaders.value = filterStaffs(staffs.value, department.id)
  // 筛选董事会成员, 作为待选董事会分管领导(董事会id:1)
  managers.value = filterStaffs(staffs.value, 1)
  // 打开表单对话框
  dialogFormVisible.value = true
}

// 修改数据
const changeDepartment = () => {
  departmentForm.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        // eslint-disable-next-line no-unused-vars
        let department = await staffHttp.changeDepartment(departmentFormData.id, departmentFormData)
        dialogFormVisible.value = false
        // departments.value.splice(department.id - 1, 1, department) //会出Bug烦死了(部门领导自己变成邮箱了)
        ElMessage.success('更新部门信息成功!页面即将刷新!')
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } catch (error) {
        ElMessage.error(error.detail)
      }
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
  <OAMain title="部门列表">
    <el-row :gutter="16">
      <el-col v-for="(department, index) in departments" :key="index" :md="8" :sm="12" :xs="24">
        <el-tooltip :content="`点击查看${department.name}详情`" placement="top" effect="light">
          <el-card shadow="hover" @click="DepartmentDetail(department)" class="handle-box">
            <template #header>
              <span>{{ department.name }}</span>
            </template>
            <div>
              <p>部门简介:</p>
              <br />
              <p class="department-intro">{{ department.intro }}</p>
            </div>
          </el-card>
        </el-tooltip>
      </el-col>
    </el-row>
  </OAMain>

  <OADialog v-model="dialogFormVisible" title="部门详情" @submit="changeDepartment">
    <el-form
      :model="departmentFormData"
      :rules="departmentFormRules"
      ref="departmentForm"
      :label-width="80"
    >
      <el-form-item label="部门编号" prop="id">
        <el-input type="text" v-model="departmentFormData.id" disabled />
      </el-form-item>
      <el-form-item label="部门名称" prop="name">
        <el-input type="text" v-model="departmentFormData.name" />
      </el-form-item>
      <el-form-item label="部门简介" prop="intro">
        <el-input type="text" v-model="departmentFormData.intro" />
      </el-form-item>
      <el-form-item label="部门领导" prop="leader">
        <el-select v-model="departmentFormData.leader">
          <el-option
            v-for="leader in leaders"
            :label="leader.realname"
            :value="leader.uid"
            :key="leader.uid"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="分管董事">
        <el-select
          v-model="departmentFormData.manager"
          placeholder="注意!董事会作为中枢部门,请勿设定分管董事!"
        >
          <el-option
            v-for="manager in managers"
            :label="manager.realname"
            :value="manager.uid"
            :key="manager.uid"
          />
        </el-select>
      </el-form-item>
    </el-form>
  </OADialog>
</template>

<style scoped>
.handle-box {
  margin-top: 50px;
}

.department-intro {
  text-indent: 2em;
  min-height: 100px;
}
</style>
