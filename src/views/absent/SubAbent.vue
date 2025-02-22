<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import absentHttp from '@/api/absentHttp'
import { ElMessage } from 'element-plus'
import timeFormatter from '@/utils/timeFormatter'
import OAMain from '@/components/OAMain.vue'
import OAPagination from '@/components/OAPagination.vue'
import OADialog from '@/components/OADialog.vue'

// 状态
let status = ref(false)
const changeStatus = (statusCode) => {
  pagination.page = 1
  status.value = statusCode
}
// 考勤列表
let absents = ref([])
// 分页
let pagination = reactive({
  total: 0,
  page: 1,
})

// 根据页码获取列表
const getSubAbsents = async () => {
  try {
    // 获取下属考勤信息
    let absentsData = await absentHttp.requestAbsents('sub', pagination.page, status.value)
    absents.value = absentsData.results
    pagination.total = absentsData.count
  } catch (detail) {
    ElMessage.error(detail)
  }
}

onMounted(async () => {
  try {
    // 获取下属考勤列表
    getSubAbsents(1)
  } catch (detail) {
    ElMessage.error(detail)
  }
})

watch(
  () => [pagination.page, status.value],
  ([newPage, newStatus]) => {
    // 获取考勤列表
    getSubAbsents(newPage, newStatus)
  },
)

/**
 * 考勤处理功能
 */
let dialogFormVisible = ref(false)
let labelName = ref('')
let fromTitle = ref('')
let handleAbsentForm = ref()
let handleAbsentFormData = reactive({
  status: 1,
  response_content: '',
})
let absentId = 0

const handleAbsentFormRules = reactive({
  response_content: [
    { required: true, message: '必须填写批复内容', trigger: 'blur' },
    { min: 2, max: 100, message: '批复内容最少2个字, 最多100个字!', trigger: 'blur' },
  ],
})

const agreeAbsent = (id) => {
  absentId = id
  fromTitle.value = '同意请假'
  labelName.value = '批复内容'
  handleAbsentFormData.status = 2
  handleAbsentFormData.response_content = '同意'
  dialogFormVisible.value = true
}

const rejectAbsent = (id) => {
  absentId = id
  fromTitle.value = '拒绝请假'
  labelName.value = '拒绝理由'
  handleAbsentFormData.status = 3
  handleAbsentFormData.response_content = '拒绝本次请假, 理由:'
  dialogFormVisible.value = true
}

const handleAbsent = () => {
  handleAbsentForm.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        await absentHttp.requestHandleAbsent(absentId, handleAbsentFormData)
        ElMessage.success('审批成功!')
        dialogFormVisible.value = false
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } catch (detail) {
        ElMessage.error(detail)
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
  <OAMain title="下属考勤">
    <el-card style="width: 1000px">
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
        <el-table-column label="申请人" width="160">
          <template #default="scope">
            <span>
              {{ scope.row.requester.department.name }}-{{ scope.row.requester.realname }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="180">
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
        <el-table-column label="处理" min-width="150" fixed="right">
          <template #default="scope">
            <div v-show="scope.row.status == 1">
              <el-tooltip content="同意" placement="top" effect="light">
                <el-button type="success" @click="agreeAbsent(scope.row.id)">
                  <el-icon><Check /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="拒绝" placement="top" effect="light">
                <el-button type="danger" @click="rejectAbsent(scope.row.id)">
                  <el-icon><Close /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
            <div v-show="scope.row.status == 2">
              <el-button type="success" disabled style="width: 103px">已处理</el-button>
            </div>
            <div v-show="scope.row.status == 3">
              <el-button type="danger" disabled style="width: 103px">已拒绝</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <OAPagination :page_size="5" :total="pagination.total" v-model="pagination.page" />
      </template>
    </el-card>
  </OAMain>

  <!-- 考勤处理 -->
  <OADialog v-model="dialogFormVisible" :title="fromTitle" @submit="handleAbsent">
    <el-form
      :model="handleAbsentFormData"
      :rules="handleAbsentFormRules"
      ref="handleAbsentForm"
      :label-width="80"
    >
      <el-form-item :label="labelName" prop="response_content">
        <el-input
          type="textarea"
          v-model="handleAbsentFormData.response_content"
          placeholder="请输入批复内容..."
          :autosize="{ minRows: 2, maxRows: 4 }"
          resize="none"
        />
      </el-form-item>
    </el-form>
  </OADialog>
</template>

<style scoped></style>
