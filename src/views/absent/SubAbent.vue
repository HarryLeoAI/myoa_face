<script setup>
import OAPageHeader from '@/components/OAPageHeader.vue'
import { ref, reactive, onMounted, watch } from 'vue'
import absentHttp from '@/api/absentHttp'
import { ElMessage } from 'element-plus'
import timeFormatter from '@/utils/timeFormatter'

// 考勤列表
let absents = ref([])
// 分页
let pagination = reactive({
  total: 0,
  page: 1,
})
// 根据页码获取列表
const getSubAbsents = async (page) => {
  try {
    // 获取下属考勤信息
    let absentsData = await absentHttp.getSubAbsents(page)
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
  } catch (error) {
    ElMessage.error(error.detail)
  }
})
watch(
  () => pagination.page,
  (value) => {
    // 获取下属考勤列表
    getSubAbsents(value)
  },
)
</script>

<template>
  <el-space style="width: 100%" direction="vertical" fill="true" :size="15">
    <OAPageHeader content="下属考勤"></OAPageHeader>
    <el-card style="width: 1000px">
      <el-table :data="absents">
        <el-table-column label="状态" fixed>
          <template #default="scope">
            <el-tag type="info" v-if="scope.row.status == 1">审核中</el-tag>
            <el-tag type="success" v-if="scope.row.status == 2">已同意</el-tag>
            <el-tag type="error" v-if="scope.row.status == 3">已拒绝</el-tag>
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
            <span v-if="scope.row.response_content">{{ scope.row.response_content }}</span>
            <span v-if="!scope.row.response_content">无</span>
          </template>
        </el-table-column>
        <el-table-column label="处理" min-width="150" fixed="right">
          <el-button type="success">
            <el-icon><Check /></el-icon>
          </el-button>
          <el-button type="danger">
            <el-icon><Close /></el-icon>
          </el-button>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-pagination
          background
          layout="prev, pager, next"
          :total="pagination.total"
          :page-size="5"
          v-model:current-page="pagination.page"
          style="justify-content: center"
        />
      </template>
    </el-card>
  </el-space>
</template>

<style scoped></style>
