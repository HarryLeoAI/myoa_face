<script setup>
import OAMain from '@/components/OAMain.vue'
import OAPagination from '@/components/OAPagination.vue'
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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
let page_size = ref(10)
let departments = ref([])
const getStaffs = async (page, size) => {
  try {
    let staffsData = await staffHttp.requestStaffs(page, size, filterForm)
    staffs.value = staffsData.results
    pagination.total = staffsData.count
  } catch (detail) {
    ElMessage.error(detail)
  }
}
onMounted(async () => {
  getStaffs(1, page_size.value)

  try {
    departments.value = await staffHttp.getDepartments()
  } catch (detail) {
    ElMessage.error(detail)
  }
})
watch(
  () => pagination.page,
  async (page) => {
    getStaffs(page, page_size.value)
  },
)
watch(
  () => page_size.value,
  async (size) => {
    getStaffs(1, size)
  },
)
// 判断是老板还是领导
const isBossOrLeader = (data) => {
  if ((data.department.leader == data.uid) & (data.department.name == '董事会')) {
    return true
  }

  return false
}
// 锁定员工
const onLock = async (uid, index) => {
  console.log(index)
  ElMessageBox.confirm('此操作将会使员工状态变为"被锁定", 确认?', '确认锁定', {
    confirmButtonText: '确认',
    cancelButtonText: '返回',
    type: 'warning',
  })
    .then(async () => {
      try {
        let staff = await staffHttp.lockStaff(uid)
        staffs.value.splice(index, 1, staff)
        ElMessage.success('成功锁定员工!')
      } catch (detail) {
        ElMessage.error(detail)
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消操作',
      })
    })
}

// 筛选
let filterForm = reactive({
  department_id: authStore.user.department.id,
  realname: '',
  date_range: [],
})
const onSearch = () => {
  getStaffs(1, page_size.value)
}
const isDirector = () => {
  if (authStore.user.department.name == '董事会') {
    return false
  }

  return true
}

// 上传
const baseAction = import.meta.env.VITE_BASE_URL
const onUploadSuccess = (data) => {
  ElMessage.success(`${data.detail}`)
  setTimeout(() => {
    window.location.reload()
  }, 10000)
}
const onUploadError = (error) => {
  ElMessage.error(JSON.parse(error.message).detail)
}

// 下载
let tableRef = ref()
const onDownload = async () => {
  let rows = tableRef.value.getSelectionRows()

  if (!rows || rows.length < 1) {
    ElMessage.info('请选择要导出的员工')
    return
  }

  let ids = rows.map((row) => row.uid)

  try {
    let response = await staffHttp.downloadStaffs(ids)

    let a = document.createElement('a')
    let href = URL.createObjectURL(response.data)
    a.href = href
    a.setAttribute('download', '员工信息.xlsx')

    document.body.appendChild(a)
    a.click()

    document.body.removeChild(a)
    URL.revokeObjectURL(href)
  } catch (detail) {
    ElMessage.error(detail)
  }
}
</script>

<template>
  <OAMain title="员工列表">
    <el-card style="width: 1000px">
      <el-form :inline="true">
        <el-form-item label="按部门">
          <el-select
            v-model="filterForm.department_id"
            style="width: 100px"
            :disabled="isDirector()"
          >
            <el-option :value="0" label="所有部门" />
            <el-option
              v-for="department in departments"
              :label="department.name"
              :value="department.id"
              :key="department.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="按姓名">
          <el-input v-model="filterForm.realname" name="realname" style="width: 100px"></el-input>
        </el-form-item>
        <el-form-item label="按入职时间">
          <el-date-picker
            v-model="filterForm.date_range"
            type="daterange"
            range-separator="到"
            start-placeholder="起始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item style="float: right">
          <el-tooltip content="点击搜索" placement="left" effect="light">
            <el-button circle @click="onSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </el-tooltip>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card style="width: 1000px">
      <template #header>
        <div class="header-box">
          <div>
            <el-form :inline="true">
              <el-form-item label="每页">
                <el-select v-model="page_size" size="small" style="width: 100px">
                  <el-option label="10条/页" :value="10" select />
                  <el-option label="20条/页" :value="20" />
                </el-select>
              </el-form-item>
            </el-form>
          </div>
          <div class="right-header">
            <el-upload
              :action="baseAction + '/staff/upload/'"
              :on-success="onUploadSuccess"
              :on-error="onUploadError"
              :headers="{ Authorization: 'JWT ' + authStore.token }"
              :show-file-list="false"
              :auto-upload="true"
              accept=".xlsx, .xls"
            >
              <el-tooltip content="点击上传Excel文件批量创建员工" placement="bottom" effect="light">
                <el-button type="primary">上传</el-button>
              </el-tooltip>
            </el-upload>
            <div>
              <el-tooltip content="点击下载被勾选员工为Excel文件" placement="bottom" effect="light">
                <el-button type="warning" @click="onDownload"> 下载 </el-button>
              </el-tooltip>
            </div>
          </div>
        </div>
      </template>
      <el-table :data="staffs" ref="tableRef">
        <el-table-column type="selection"></el-table-column>
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
              {{ isBossOrLeader(scope.row) ? '老板' : '领导' }}
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
              <el-button type="danger" @click="onLock(scope.row.uid, scope.$index)">
                <el-icon><Lock /></el-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <OAPagination :page_size="page_size" :total="pagination.total" v-model="pagination.page" />
      </template>
    </el-card>
  </OAMain>
</template>

<style scoped>
.header-box {
  display: flex;
  justify-content: space-between;
}
.right-header {
  display: flex;
  justify-content: space-between;
  min-width: 130px;
}
</style>
