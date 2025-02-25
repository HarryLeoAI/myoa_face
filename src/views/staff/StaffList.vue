<script setup>
import OAMain from '@/components/OAMain.vue'
import OAPagination from '@/components/OAPagination.vue'
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import staffHttp from '@/api/staffHttp'
import timeFormatter from '@/utils/timeFormatter'
import { useAuthStore } from '@/stores/auth'

let authStore = useAuthStore()

// 获取数据
let staffs = ref([])
let pagination = reactive({
  total: 0,
  page: 1,
})
const getStaffs = async (page) => {
  try {
    let staffsData = await staffHttp.requestStaffs(page)
    console.log(staffsData.results)
    staffs.value = staffsData.results
    pagination.total = staffsData.count
  } catch (detail) {
    ElMessage.error(detail)
  }
}
onMounted(async () => {
  getStaffs(1)
})
watch(
  () => pagination.page,
  async (page) => {
    getStaffs(page)
  },
)
const isBoss = (data) => {
  if ((data.department.leader == data.uid) & (data.department.name == '董事会')) {
    return true
  }

  return false
}
</script>

<template>
  <OAMain title="员工列表">
    <el-card style="width: 1000px">
      <template #header>
        <p v-if="authStore.user.department.name == '董事会'">您是[董事会]成员, 可以查看所有员工</p>
        <p v-if="authStore.user.department.name != '董事会'">
          您是[{{ authStore.user.department.name }}]领导, 可以查看本部员工
        </p>
      </template>
      <el-table :data="staffs">
        <el-table-column label="当前状态" fixed width="120" prop="status">
          <template #default="scope">
            <el-tag v-show="scope.row.status == 3" type="danger">被锁定</el-tag>
            <el-tag v-show="scope.row.status == 2" type="info">待激活</el-tag>
            <el-tag v-show="scope.row.status == 1" type="success">已激活</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="姓名" fixed width="80" prop="realname"></el-table-column>

        <el-table-column label="部门" width="120" prop="department.name"></el-table-column>
        <el-table-column label="职务" width="80">
          <template #default="scope">
            <span v-show="scope.row.department.leader == scope.row.uid" style="color: red">
              {{ isBoss(scope.row) ? '老板' : '领导' }}
            </span>
            <span v-show="scope.row.department.leader != scope.row.uid"> 职员 </span>
          </template>
        </el-table-column>
        <el-table-column label="邮箱" width="280" prop="email"></el-table-column>
        <el-table-column label="电话" width="120" prop="telphone"></el-table-column>
        <el-table-column label="入职时间" width="120">
          <template #default="scope">
            <el-tooltip
              :content="'具体时间:' + timeFormatter.stringFromDateTime(scope.row.date_joined)"
              placement="top"
              effect="light"
            >
              <span> {{ timeFormatter.stringFromDate(scope.row.date_joined) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right">
          <template #default="scope">
            <el-tooltip content="点击禁用已离职员工" placement="top" effect="light">
              <el-button type="danger" @click="onDelete(scope.row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <OAPagination :page_size="10" :total="pagination.total" v-model="pagination.page" />
      </template>
    </el-card>
  </OAMain>
</template>

<style scoped></style>
