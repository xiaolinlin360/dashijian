<script setup>
import { useUserStore } from '@/stores'
import { ref } from 'vue'
import { userUpdateInfoService } from '@/api/user'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
const userStore = useUserStore()
const {
  user: { username, email, id },
} = userStore
const loading = ref(false)
const imgUrl = ref('')
const isFile = ref(false)
const handleAvatarChange = (file) => {
  imgUrl.value = URL.createObjectURL(file.raw)
  userInfo.value.avatar = file.raw
  isFile.value = true
}
const userInfo = ref({ username, id, avatar: '' })

const rules = {
  username: [
    { required: true, message: '请输入用户昵称', trigger: 'blur' },
    {
      pattern: /^\S{2,10}$/,
      message: '昵称必须是2-10位的非空字符',
      trigger: 'blur',
    },
  ],
}

const formRef = ref(null)
const submitForm = async () => {
  loading.value = true
  try {
    await formRef.value.validate()
    delete userInfo.value.email

    await userUpdateInfoService(userInfo.value, isFile.value)

    const userId = await userStore.getUserId()
    await userStore.getUser(userId)
    ElMessage.success('修改成功')
  } catch {
    ElMessage.error('未填写完整信息或上传失败')
  } finally {
    loading.value = false
    isFile.value = false
  }
}
</script>

<template>
  <page-container title="基本资料">
    <el-row>
      <el-col :span="12">
        <el-form :model="userInfo" :rules="rules" ref="formRef" label-width="100px" size="large">
          <el-form-item label="用户昵称" prop="username">
            <el-input v-model="userInfo.username"></el-input>
          </el-form-item>
          <el-form-item label="用户邮箱" prop="email">
            <el-input v-model="email" disabled></el-input>
          </el-form-item>
          <el-form-item label="用户头像" prop="avatar">
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :auto-upload="false"
              @change="handleAvatarChange"
            >
              <img v-if="imgUrl" :src="imgUrl" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="loading" @click="submitForm">提交修改</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </page-container>
</template>

<style scoped>
.avatar-uploader .avatar {
  width: 178px;
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
