<script setup>
import { ref } from 'vue'
const visibleDrawer = ref(false)
import ChannelSelect from './ChannelSelect.vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { artAddService } from '@/api/article'
const imgUrl = ref('')
const editorKey = ref(0)
const formRef = ref(null)
const emit = defineEmits(['refreshArticleList'])
const loading = ref(false)
const isFile = ref(false)

const onSelectFile = (file) => {
  if (!file || !file?.raw?.type?.startsWith('image/') || file.size / 1024 / 1024 > 4) {
    ElMessage.error('请上传4MB以下图片')
    // 提示用户只能上传图片
    return false
  }
  imgUrl.value = URL.createObjectURL(file.raw)
  isFile.value = true
  formModel.value.cover_img = file.raw
}
//数据
const defaultModel = ref({
  id: '',
  title: '',
  article_id: '',
  cover_img: '',
  content: '',
  state: '',
})
const formModel = ref({ ...defaultModel.value })
//规则rules
const rules = ref({
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  article_id: [{ required: true, message: '请选择文章分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入文章内容', trigger: 'blur' }],
})
// 发布或编辑文章
const onPublish = async (state) => {
  loading.value = true
  formModel.value.state = state
  try {
    await formRef.value.validate()
    await artAddService(formModel.value, isFile.value)
    ElMessage.success(formModel.value.id || formModel.value.id === 0 ? '编辑成功' : '添加成功')
    //通知父组件刷新文章列表
    emit('refreshArticleList')
    visibleDrawer.value = false
  } catch {
    ElMessage.error(formModel.value.id || formModel.value.id === 0 ? '编辑失败' : '添加失败')
  } finally {
    loading.value = false
  }
}
const open = (res) => {
  if (res.state) {
    formModel.value.title = res.title
    formModel.value.article_id = res.article_id
    imgUrl.value = formModel.value.cover_img = res.cover_img
    formModel.value.content = res.content
    formModel.value.state = res.state
    formModel.value.id = res.id
  } else {
    formModel.value = { ...defaultModel.value } // 重置表单数据
    editorKey.value++
    imgUrl.value = ''
    delete formModel.value.id //添加不需要id属性
  }
  visibleDrawer.value = true
  isFile.value = false
}
defineExpose({
  open,
})
</script>

<template>
  <el-drawer
    v-model="visibleDrawer"
    :title="formModel.article_id ? '编辑文章' : '添加文章'"
    direction="rtl"
    size="50%"
  >
    <!-- 发表文章表单 -->
    <el-form :model="formModel" ref="formRef" label-width="100px" :rules="rules">
      <el-form-item label="文章标题" prop="title">
        <el-input v-model="formModel.title" placeholder="请输入标题"></el-input>
      </el-form-item>
      <el-form-item label="文章分类" prop="article_id">
        <channel-select v-model="formModel.article_id" width="100%"></channel-select>
      </el-form-item>
      <el-form-item label="文章封面">
        <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          :on-change="onSelectFile"
          :auto-upload="false"
        >
          <img v-if="imgUrl" :src="imgUrl" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="文章内容" prop="content">
        <div>
          <QuillEditor
            v-model:content="formModel.content"
            content-type="html"
            theme="snow"
            style="min-height: 150px"
            :key="editorKey"
          />
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="onPublish('已发布')">发布</el-button>
        <el-button type="info" :loading="loading" @click="onPublish('草稿')">草稿</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>
<style scoped>
.avatar-uploader .avatar {
  height: 178px;
  display: block;
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
