<script setup>
import OAMain from '@/components/OAMain.vue'
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import informHttp from '@/api/informHttp'
import { ElMessage } from 'element-plus'
import timeFormatter from '@/utils/timeFormatter'

const route = useRoute()
let inform = ref({})
let author = ref('')
let department = ref('')
let date = ref('')
let time = ref('')
onMounted(async () => {
  try {
    inform.value = await informHttp.requestInformDetail(route.params.pk)
  } catch (error) {
    ElMessage.error(error)
  }

  author.value = inform.value.author.realname
  department.value = inform.value.author.department.name
  date.value = timeFormatter.stringFromDate(inform.value.create_time)
  time.value = timeFormatter.stringFromDateTime(inform.value.create_time)
})
</script>

<template>
  <OAMain title="通知详情">
    <el-card style="width: 1000px">
      <template #header>
        <h1 style="text-align: center">{{ inform.title }}</h1>
      </template>
      <div v-html="inform.content"></div>
      <template #footer>
        <div class="detail-footer">
          <div>
            <div v-if="inform.public">
              <el-tag type="danger">所有部门可见</el-tag>
            </div>
            <div v-if="!inform.public">
              <span>可见部门:</span>
              <el-tag
                class="department-tag"
                v-for="department in inform.departments"
                :key="department.id"
              >
                {{ department.name }}
              </el-tag>
            </div>
          </div>
          <div>
            <el-tooltip :content="'准确时间:' + time" placement="left" effect="dark">
              <span> {{ date }}, {{ department }}-{{ author }} </span>
            </el-tooltip>
          </div>
        </div>
      </template>
    </el-card>
  </OAMain>
</template>

<style scoped>
.detail-footer {
  display: flex;
  justify-content: space-between;
}
.department-tag {
  margin: 0 5px 0 5px;
}
</style>
