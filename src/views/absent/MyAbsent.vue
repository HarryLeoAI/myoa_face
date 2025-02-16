<script setup>
import { ref, reactive, onMounted } from 'vue'
import OAPageHeader from '@/components/OAPageHeader.vue'
import absentHttp from '@/api/absentHttp'
import { ElMessage } from 'element-plus'

/**
 * 发起考勤功能
 */
//  表单样式配置
const formLabelWidth = '80px'
let dialogFormVisible = ref(false)

// 表单数据初始化
let createAbsentdForm = ref()
const createAbsentdFormData = reactive({
  title: '',
  content: '',
  absent_type_id: null,
  date_range: '',
})

// 获取请假类型和审批者
let absent_types = ref([])
let responder = reactive({
  realname: '',
  department: {},
})
onMounted(async () => {
  try {
    // 获取请假类型
    let absent_types_data = await absentHttp.getAbsentTypes()
    absent_types.value = absent_types_data

    // 获取审批者
    let responder_data = await absentHttp.getResponder()
    Object.assign(responder, responder_data)
  } catch (detail) {
    ElMessage.error(detail)
  }
})

// 表单验证规则
const createAbsentFormrules = reactive({
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
const createAbsent = () => {
  console.log(createAbsentdFormData)
  dialogFormVisible.value = false
}

/**
 * 发起考勤结束
 */
</script>

<template>
  <el-space style="width: 100%" direction="vertical" fill="true" :size="15">
    <OAPageHeader content="个人考勤"></OAPageHeader>
    <el-card style="text-align: right">
      <el-button type="primary" @click="toggleCreateAbsentForm">
        <el-icon><Plus /></el-icon>
        <span>发起考勤</span>
      </el-button>
    </el-card>
  </el-space>

  <!-- 发起考勤对话框 -->
  <el-dialog v-model="dialogFormVisible" title="发起请假" width="500">
    <el-form :model="createAbsentdFormData" :rules="createAbsentFormrules" ref="createAbsentdForm">
      <el-form-item label="请假标题" :label-width="formLabelWidth" prop="title">
        <el-input type="text" v-model="createAbsentdFormData.title" />
      </el-form-item>
      <el-form-item label="请假类型" :label-width="formLabelWidth" prop="absent_type_id">
        <el-select v-model="createAbsentdFormData.absent_type_id">
          <el-option
            v-for="absent_type in absent_types"
            :label="absent_type.name"
            :value="absent_type.id"
            :key="absent_type.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="请假时间" :label-width="formLabelWidth" prop="date_range">
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
      <el-form-item label="请假内容" :label-width="formLabelWidth" prop="content">
        <el-input
          type="textarea"
          v-model="createAbsentdFormData.content"
          placeholder="请输入请假理由..."
          :autosize="{ minRows: 2, maxRows: 4 }"
          resize="none"
        />
      </el-form-item>
      <el-form-item label="审批领导" :label-width="formLabelWidth" prop="">
        <el-input
          type="text"
          :value="responder.realname ? responder.department.name + '-' + responder.realname : '无'"
          disabled
          readonly="true"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false"> 返回 </el-button>
        <el-button type="primary" @click="createAbsent"> 确认 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped></style>
