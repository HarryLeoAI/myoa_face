<script setup>
import OAMain from '@/components/OAMain.vue'
import { useRoute } from 'vue-router'
import { onMounted, reactive } from 'vue'
import informHttp from '@/api/informHttp'
import { ElMessage } from 'element-plus'
import timeFormatter from '@/utils/timeFormatter'

const route = useRoute()

let inform = reactive({
  id: 0,
  title: '',
  author: {
    realname: '',
    department: {
      name: '',
    },
  },
  departments: [],
  public: false,
  been_read: 0,
  create_time: '',
})
onMounted(async () => {
  try {
    let informData = await informHttp.requestInformDetail(route.params.pk)
    Object.assign(inform, informData)
    await informHttp.readInform(inform.id)
  } catch (error) {
    ElMessage.error(error)
  }
})
</script>

<template>
  <OAMain title="通知详情">
    <el-card style="width: 1000px">
      <template #header>
        <el-tooltip :content="'已读人数:' + inform.been_read" placement="bottom" effect="light">
          <h1 style="text-align: center">
            {{ inform.title }}
          </h1>
        </el-tooltip>
      </template>
      <div v-html="inform.content"></div>
      <template #footer>
        <div class="detail-footer">
          <div>
            <div v-if="inform.public">
              <el-tag type="danger">所有部门可见</el-tag>
            </div>
            <div v-if="!inform.public">
              <el-tooltip content="可见部门" placement="right" effect="dark">
                <div class="departments-space">
                  <el-tag
                    class="department-tag"
                    v-for="department in inform.departments"
                    :key="department.id"
                  >
                    {{ department.name }}
                  </el-tag>
                </div>
              </el-tooltip>
            </div>
          </div>
          <div>
            <el-tooltip
              :content="'准确时间:' + timeFormatter.stringFromDateTime(inform.create_time)"
              placement="left"
              effect="dark"
            >
              <span>
                {{ timeFormatter.stringFromDate(inform.create_time) }},
                {{ inform.author.department.name }}-{{ inform.author.realname }}
              </span>
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
.departments-space {
  display: inline;
}
</style>
