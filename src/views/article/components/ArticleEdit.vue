<script setup>
import { ref } from 'vue'
const visibleDrawer = ref(false)
import ChannelSelect from './ChannelSelect.vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
const imgUrl = ref('')

const onSelectFile = (file) => {
  if (!file || !file?.raw?.type?.startsWith('image/') || file.size / 1024 / 1024 > 4) {
    ElMessage.error('请上传4MB以下图片')
    // 提示用户只能上传图片
    return false
  }
  imgUrl.value = URL.createObjectURL(file.raw)
}
//数据
const defaultModel = ref({
  title: '',
  article_id: '',
  cover_img: '',
  content: '',
  state: '',
})
const formModel = ref({ ...defaultModel.value })
const open = (res) => {
  if (res.state) {
    formModel.value.title = res.data.title
    formModel.value.article_id = res.data.article_id
    formModel.value.cover_img = res.data.cover_img
    formModel.value.content = res.data.content
    formModel.value.state = res.data.state
  } else {
    formModel.value = { ...defaultModel.value } // 重置表单数据
    imgUrl.value = ''
    console.log('添加')
  }
  visibleDrawer.value = true
}
defineExpose({
  open,
})
</script>

<template>
  <el-drawer
    v-model="visibleDrawer"
    :title="formModel.id ? '编辑文章' : '添加文章'"
    direction="rtl"
    size="50%"
  >
    <!-- 发表文章表单 -->
    <el-form :model="formModel" ref="formRef" label-width="100px">
      <el-form-item label="文章标题" prop="title">
        <el-input v-model="formModel.title" placeholder="请输入标题"></el-input>
      </el-form-item>
      <el-form-item label="文章分类" prop="article_id">
        <channel-select v-model="formModel.article_id" width="100%"></channel-select>
      </el-form-item>
      <el-form-item label="文章封面" prop="cover_img">
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
        <div class="editor">富文本编辑器</div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary">发布</el-button>
        <el-button type="info">草稿</el-button>
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
