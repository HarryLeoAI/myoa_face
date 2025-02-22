<script setup>
import OAMain from '@/components/OAMain.vue'
import OAPagination from '@/components/OAPagination.vue'
import { onMounted, ref, reactive, watch, h } from 'vue'
import informHttp from '@/api/informHttp'
import { ElMessage, ElMessageBox } from 'element-plus'
import timeFormatter from '@/utils/timeFormatter'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

/**
 * 获取数据
 */
let informs = ref([])
let pagination = reactive({
  total: 0,
  page: 1,
})
const getInform = async (page) => {
  try {
    let informsData = await informHttp.requestInform(page)
    informs.value = informsData.results
    pagination.total = informsData.count
  } catch (detail) {
    ElMessage(detail)
  }
}
onMounted(async () => {
  getInform(1)
})
watch(
  () => pagination.page,
  async (page) => {
    getInform(page)
  },
)

/**
 * 生成随机颜色 - 用于展示部门名称
 */
const getRandomColor = () => {
  const r = 0
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * 判断删除按钮是否禁用
 */
const deleteButtonAvailable = (author) => {
  if (author.uid == authStore.user.uid) {
    return false
  } else {
    return true
  }
}

/**
 * 查看详情
 */
const onDetail = (id) => {
  console.log(`当前行inform的id是${id}`)
  // ...
}

/**
 * 删除
 */

const onDelete = (data) => {
  ElMessageBox.confirm(
    h('div', null, [
      h('p', null, `标题为:【${data.title}】`),
      h('p', null, `发布时间是:【${timeFormatter.stringFromDateTime(data.create_time)}】`),
      h('p', { style: 'color:red;' }, '确认删除?'),
    ]),
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    },
  )
    .then(async () => {
      try {
        await informHttp.deleteInform(data.id)
        ElMessage.success('删除成功')
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } catch (error) {
        ElMessage.error(error)
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消删除',
      })
    })
}
</script>

<template>
  <OAMain title="通知列表">
    <el-card style="width: 1000px; text-align: right">
      <el-table :data="informs">
        <el-table-column label="通知标题" fixed width="200">
          <template #default="scope">
            <el-tooltip content="点击标题查看详情" placement="top" effect="dark">
              <router-link
                class="title-router"
                :to="{ name: 'informdetail', params: { pk: scope.row.id } }"
              >
                {{ scope.row.title }}
              </router-link>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="通知发布者" width="200">
          <template #default="scope">
            <span> {{ scope.row.author.department.name }}-{{ scope.row.author.realname }} </span>
          </template>
        </el-table-column>
        <el-table-column label="可见部门" width="400">
          <template #default="scope">
            <div v-if="!scope.row.public">
              <span
                v-for="department in scope.row.departments"
                :key="department.id"
                :style="{ color: getRandomColor() }"
              >
                {{ department.name }} &nbsp;
              </span>
            </div>
            <div v-if="scope.row.public">
              <span style="color: red">所有部门可见</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="通知时间" width="200">
          <template #default="scope">
            <span>{{ timeFormatter.stringFromDateTime(scope.row.create_time) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="150" fixed="right">
          <template #default="scope">
            <el-tooltip content="查看详情" placement="top" effect="light">
              <el-button type="success" @click="onDetail(scope.row.id)">
                <el-icon><View /></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="删除通知" placement="top" effect="light">
              <el-button
                type="danger"
                @click="onDelete(scope.row)"
                :disabled="deleteButtonAvailable(scope.row.author)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <OAPagination :page_size="5" :total="pagination.total" v-model="pagination.page" />
      </template>
    </el-card>
  </OAMain>
</template>

<style scoped>
.title-router {
  text-decoration: none;
  color: #000;
  font-weight: bold;
}
</style>
