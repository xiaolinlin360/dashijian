<script setup>
import { useUserStore } from '@/stores'
import { ref } from 'vue'
import { userUpdateUsernameService } from '@/api/user'
import { ElMessage } from 'element-plus'
const userStore = useUserStore()
const {
  user: { username, email, id },
} = userStore
const loading = ref(false)

const userInfo = ref({ username, id })

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
    await userUpdateUsernameService(userInfo.value)

    const userId = await userStore.getUserId()
    await userStore.getUser(userId)
    ElMessage.success('修改成功')
  } catch {
    ElMessage.error('未填写完整信息或上传失败')
  } finally {
    loading.value = false
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
          <el-form-item>
            <el-button type="primary" :loading="loading" @click="submitForm">提交修改</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </page-container>
</template>
