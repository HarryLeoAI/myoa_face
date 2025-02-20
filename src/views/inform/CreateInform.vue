<script setup>
import OAMain from '@/components/OAMain.vue'
import { ref, reactive, onBeforeUnmount, shallowRef, onMounted } from 'vue'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { ElMessage } from 'element-plus'
import staffHttp from '@/api/staffHttp'

// 获取部门数据
let departments = ref([])
onMounted(async () => {
  try {
    departments.value = await staffHttp.getDepartments()
  } catch (detail) {
    ElMessage.error(detail)
  }
})

// 表单
let createInformForm = ref()
let createInformFormData = reactive({
  title: '',
  content: '',
  department_ids: [],
})

const createInformFormRules = reactive({
  title: [
    { required: true, message: '必须填写通知标题', trigger: 'blur' },
    { min: 2, max: 20, message: '标题最少2个字,最多20个字', trigger: 'blur' },
  ],
  // 没办法, wangEditor不填内容就是"<p><br></p>", 填一个字符1就是"<p>1</p>", 所以不能少于17个字符, 一对p标签就是7个字
  // 再加上10个字的内容
  // 就是做不了required必填验证
  content: [{ min: 17, message: '必须填写通知内容!且不少于10个字', trigger: 'blur' }],
})

/**
 * wangEditor
 */
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

const toolbarConfig = {}
const editorConfig = { placeholder: '请输入内容...' }
let mode = 'default'

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

const onSubmit = () => {
  createInformForm.value.validate((valid, fields) => {
    if (valid) {
      console.log(createInformFormData)
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
  <OAMain title="发布通知">
    <el-card style="width: 1000px">
      <template #header>
        <h1 style="text-align: center">发布通知</h1>
      </template>
      <el-form
        :model="createInformFormData"
        :rules="createInformFormRules"
        ref="createInformForm"
        :label-width="100"
      >
        <el-form-item label="通知标题" prop="title">
          <el-input type="text" v-model="createInformFormData.title" />
        </el-form-item>
        <el-form-item label="通知内容" prop="content">
          <div style="border: 1px solid #ccc; width: 100%">
            <Toolbar
              style="border-bottom: 1px solid #ccc"
              :editor="editorRef"
              :defaultConfig="toolbarConfig"
              :mode="mode"
            />
            <Editor
              style="height: 500px; overflow-y: hidden"
              v-model="createInformFormData.content"
              :defaultConfig="editorConfig"
              :mode="mode"
              @onCreated="handleCreated"
            />
          </div>
        </el-form-item>
        <el-form-item label="可见部门">
          <el-checkbox-group v-model="createInformFormData.department_ids">
            <el-tooltip
              content="注意: 所有部门被勾选时, 即使勾选了其他部门也被视为所有部门可见!"
              placement="top"
              effect="light"
            >
              <el-checkbox label="所有部门" :value="0" />
            </el-tooltip>
            <el-checkbox
              v-for="department in departments"
              :label="department.name"
              :value="department.id"
              :key="department.id"
            />
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div style="text-align: center">
          <el-button type="primary" class="create-inform-submit-button" @click="onSubmit">
            提交
          </el-button>
        </div>
      </template>
    </el-card>
  </OAMain>
</template>

<style scoped>
.create-inform-submit-button {
  margin-bottom: 20px;
  width: 100px;
  height: 40px;
}
</style>
