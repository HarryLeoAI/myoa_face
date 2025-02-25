<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import absentHttp from '@/api/absentHttp'
import { ElMessage } from 'element-plus'
import timeFormatter from '@/utils/timeFormatter'
import OAMain from '@/components/OAMain.vue'
import OAPagination from '@/components/OAPagination.vue'
import OADialog from '@/components/OADialog.vue'

// 请假类型和审批者
let absent_types = ref([])
let responder = reactive({
  realname: '',
  department: {},
})
// 请假列表
let absents = ref([])
// 请假列表分页
let pagination = reactive({
  total: 0,
  page: 1,
})
// 状态
let status = ref(false)
const changeStatus = (statusCode) => {
  pagination.page = 1
  status.value = statusCode
}
// 封装函数:根据页码获取列表
const getMyAbsents = async () => {
  try {
    // 获取个人考勤信息
    let absentsData = await absentHttp.requestAbsents('my', pagination.page, status.value)
    absents.value = absentsData.results
    pagination.total = absentsData.count
  } catch (detail) {
    ElMessage.error(detail)
  }
}
onMounted(async () => {
  try {
    // 获取请假类型
    let absent_types_data = await absentHttp.getAbsentTypes()
    absent_types.value = absent_types_data

    // 获取审批者
    let responder_data = await absentHttp.getResponder()
    Object.assign(responder, responder_data)

    // 获取考勤列表
    getMyAbsents(1)
  } catch (detail) {
    ElMessage.error(detail)
  }
})
watch(
  () => [pagination.page, status.value],
  ([newPage, newStatus]) => {
    // 获取考勤列表
    getMyAbsents(newPage, newStatus)
  },
)
/**
 * 发起考勤功能
 */
//  表单样式配置
let dialogFormVisible = ref(false)

// 表单数据初始化
let createAbsentdForm = ref()
const createAbsentdFormData = reactive({
  title: '',
  content: '',
  absent_type_id: null,
  date_range: '',
})
// 表单验证规则
const createAbsentFormRules = reactive({
  title: [
    { required: true, message: '请输入标题！', trigger: 'blur' },
    { min: 4, max: 30, message: '请假标题必须在4~30个字之间!', trigger: 'blur' },
  ],
  absent_type_id: [{ required: true, message: '请选择请假类型！', trigger: 'change' }],
  date_range: [{ required: true, message: '请选择请假时间！', trigger: 'blur' }],
  content: [
    { required: true, message: '请输入请假理由！', trigger: 'blur' },
    { min: 10, message: '请假内容不能少于10个字', trigger: 'blur' },
  ],
})

// 对话框开关函数
const toggleCreateAbsentForm = () => {
  createAbsentdFormData.title = ''
  createAbsentdFormData.content = ''
  createAbsentdFormData.absent_type_id = ''
  createAbsentdFormData.date_range = ''
  dialogFormVisible.value = true
}

// 提交表单
const createAbsent = async () => {
  // 验证数据
  createAbsentdForm.value.validate(async (valid, fields) => {
    if (valid) {
      // 处理数据
      createAbsentdFormData.start_date = createAbsentdFormData.date_range[0]
      createAbsentdFormData.end_date = createAbsentdFormData.date_range[1]
      delete createAbsentdFormData.date_range
      try {
        let absent = await absentHttp.createAbsent(createAbsentdFormData)
        ElMessage.success('考勤提交成功!')
        absents.value.unshift(absent)
      } catch (detail) {
        ElMessage.error(detail)
      }
      dialogFormVisible.value = false
    } else {
      for (let key in fields) {
        ElMessage.error(fields[key][0]['message'])
      }
      return false
    }
  })
}
/**
 * 发起考勤结束
 */
</script>

<template>
  <OAMain title="个人考勤">
    <el-card style="width: 1000px">
      <div class="header-box">
        <div v-show="!responder.realname">
          <el-button type="success" @click="changeStatus(2)" disabled>
            <el-icon><Check /></el-icon>
            <span>因为您是老板, 所以考勤自动通过</span>
          </el-button>
        </div>
        <div v-show="responder.realname">
          <el-button type="primary" @click="changeStatus(false)">
            <el-icon><List /></el-icon>
            <span>全部</span>
          </el-button>
          <el-button type="info" @click="changeStatus(1)">
            <el-icon><Filter /></el-icon>
            <span>待审核</span>
          </el-button>
          <el-button type="success" @click="changeStatus(2)">
            <el-icon><Filter /></el-icon>
            <span>已同意</span>
          </el-button>
          <el-button type="danger" @click="changeStatus(3)">
            <el-icon><Filter /></el-icon>
            <span>已拒绝</span>
          </el-button>
        </div>
        <div>
          <el-button type="primary" plain @click="toggleCreateAbsentForm">
            <el-icon><Plus /></el-icon>
            <span>发起考勤</span>
          </el-button>
        </div>
      </div>
    </el-card>

    <el-card style="width: 1000px">
      <el-table :data="absents">
        <el-table-column label="状态" fixed>
          <template #default="scope">
            <span v-show="scope.row.status == 1">
              <el-tag type="info">审核中</el-tag>
            </span>
            <span v-show="scope.row.status == 2">
              <el-tag type="success">已同意</el-tag>
            </span>
            <span v-show="scope.row.status == 3">
              <el-tag type="danger">已拒绝</el-tag>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="absent_type.name" label="类型" width="70" />
        <el-table-column prop="title" label="标题" width="100" />
        <el-table-column prop="content" label="详情" width="260" />
        <el-table-column prop="start_date" label="请假日期" width="110" />
        <el-table-column prop="end_date" label="结束日期" width="110" />
        <el-table-column label="申请时间" width="170">
          <template #default="scope">
            <span>
              {{ timeFormatter.stringFromDateTime(scope.row.create_time) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="审核回复" width="260">
          <template #default="scope">
            <span v-show="scope.row.response_content">{{ scope.row.response_content }}</span>
            <span v-show="!scope.row.response_content">无</span>
          </template>
        </el-table-column>
        <el-table-column label="审核领导" min-width="150" fixed="right">
          <span v-show="responder.realname">
            {{ responder.department.name }}-{{ responder.realname }}
          </span>
          <span v-show="!responder.realname">您就是老板</span>
        </el-table-column>
      </el-table>
      <template #footer>
        <OAPagination :page_size="5" :total="pagination.total" v-model="pagination.page" />
      </template>
    </el-card>
  </OAMain>

  <!-- 发起考勤对话框 -->
  <OADialog v-model="dialogFormVisible" title="发起考勤" @submit="createAbsent">
    <el-form
      :model="createAbsentdFormData"
      :rules="createAbsentFormRules"
      ref="createAbsentdForm"
      :label-width="80"
    >
      <el-form-item label="请假标题" prop="title">
        <el-input type="text" v-model="createAbsentdFormData.title" />
      </el-form-item>
      <el-form-item label="请假类型" prop="absent_type_id">
        <el-select v-model="createAbsentdFormData.absent_type_id">
          <el-option
            v-for="absent_type in absent_types"
            :label="absent_type.name"
            :value="absent_type.id"
            :key="absent_type.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="请假时间" prop="date_range">
        <el-date-picker
          v-model="createAbsentdFormData.date_range"
          type="daterange"
          range-separator="到"
          start-placeholder="起始日期"
          end-placeholder="结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="请假内容" prop="content">
        <el-input
          type="textarea"
          v-model="createAbsentdFormData.content"
          placeholder="请输入请假理由..."
          :autosize="{ minRows: 2, maxRows: 4 }"
          resize="none"
        />
      </el-form-item>
      <el-form-item label="审批领导">
        <el-input
          type="text"
          :value="
            responder.realname ? responder.department.name + '-' + responder.realname : '您就是老板'
          "
          disabled
          readonly="true"
        />
      </el-form-item>
    </el-form>
  </OADialog>
</template>

<style scoped>
.header-box {
  display: flex;
  justify-content: space-between;
}
</style>
