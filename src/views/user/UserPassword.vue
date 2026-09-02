<script setup>
import { ref } from 'vue'
import { userUpdatePasswordService, userUpdateEmailService } from '@/api/user'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/mods/user'
const userStore = useUserStore()
const loading = ref(false)
const formRef = ref(null)
const pwdForm = ref({
  old_pwd: '',
  new_pwd: '',
  re_pwd: '',
})

const checkOldSame = (rule, value, cb) => {
  if (value === pwdForm.value.old_pwd) {
    cb(new Error('原密码和新密码不能一样!'))
  } else {
    cb()
  }
}

const checkNewSame = (rule, value, cb) => {
  if (value !== pwdForm.value.new_pwd) {
    cb(new Error('新密码和确认再次输入的新密码不一样!'))
  } else {
    cb()
  }
}
const rules = {
  // 原密码
  old_pwd: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      pattern: /^\S{6,15}$/,
      message: '密码长度必须是6-15位的非空字符串',
      trigger: 'blur',
    },
  ],
  // 新密码
  new_pwd: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    {
      pattern: /^\S{6,15}$/,
      message: '密码长度必须是6-15位的非空字符串',
      trigger: 'blur',
    },
    { validator: checkOldSame, trigger: 'blur' },
  ],
  // 确认新密码
  re_pwd: [
    { required: true, message: '请再次确认新密码', trigger: 'blur' },
    {
      pattern: /^\S{6,15}$/,
      message: '密码长度必须是6-15位的非空字符串',
      trigger: 'blur',
    },
    { validator: checkNewSame, trigger: 'blur' },
  ],
}
// 修改密码提交
const onSubmit = async () => {
  loading.value = true
  try {
    await formRef.value.validate()
    await userUpdatePasswordService(pwdForm.value)
    ElMessage.success('修改密码成功')
    userStore.logout()
  } catch {
    ElMessage.error('修改密码失败')
  } finally {
    loading.value = false
  }
}
// 重置密码
const onReset = () => {
  pwdForm.value.old_pwd = ''
  pwdForm.value.new_pwd = ''
  pwdForm.value.re_pwd = ''
}

const loadings = ref(false)
const pwdForms = ref({
  old_email: '',
  new_email: '',
})
const formRefs = ref(null)
const rulesEmail = {
  old_email: [
    { required: true, message: '请输入原邮箱', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,
      message: '请输入正确的邮箱格式',
      trigger: 'blur',
    },
  ],
  new_email: [
    { required: true, message: '请输入新邮箱', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,
      message: '请输入正确的邮箱格式',
      trigger: 'blur',
    },
  ],
}
// 修改邮箱提交

const onSubmits = async () => {
  loadings.value = true
  try {
    await formRefs.value.validate()
    await userUpdateEmailService(pwdForms.value)
    ElMessage.success('修改邮箱成功')
    ElMessage.warning('请在新邮箱以及原来邮箱中双重确认修改')

    userStore.logout()
  } catch {
    ElMessage.error('修改邮箱失败')
  } finally {
    loadings.value = false
  }
}
// 重置邮箱
const onResets = () => {
  pwdForms.value.old_email = ''
  pwdForms.value.new_pwd = ''
}
</script>
<template>
  <page-container title="重置密码">
    <el-row>
      <el-col :span="11">
        <el-form :model="pwdForm" :rules="rules" ref="formRef" label-width="100px" size="large">
          <el-form-item label="原密码" prop="old_pwd">
            <el-input v-model="pwdForm.old_pwd" type="password"></el-input>
          </el-form-item>
          <el-form-item label="新密码" prop="new_pwd">
            <el-input v-model="pwdForm.new_pwd" type="password"></el-input>
          </el-form-item>
          <el-form-item label="确认新密码" prop="re_pwd">
            <el-input v-model="pwdForm.re_pwd" type="password"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button @click="onSubmit" type="primary" :loading="loading">修改密码</el-button>
            <el-button @click="onReset">重置</el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="2"> </el-col>
      <el-col :span="11">
        <el-form
          :model="pwdForms"
          :rules="rulesEmail"
          ref="formRefs"
          label-width="100px"
          size="large"
        >
          <el-form-item label="原邮箱" prop="old_email">
            <el-input v-model="pwdForms.old_email" type="email"></el-input>
          </el-form-item>
          <el-form-item label="新邮箱" prop="new_email">
            <el-input v-model="pwdForms.new_email" type="email"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button @click="onSubmits" type="primary" :loading="loadings">修改邮箱</el-button>
            <el-button @click="onResets">重置</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </page-container>
</template>
