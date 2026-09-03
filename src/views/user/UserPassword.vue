<script setup>
import { ref } from 'vue'
import {
  userUpdatePasswordService,
  userUpdateEmailService,
  userVerifyEmailChangeService,
} from '@/api/user'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/mods/user'
import { Lock, Message, Key } from '@element-plus/icons-vue'
const userStore = useUserStore()
const loading = ref(false)
const formRef = ref(null)
const countdown = ref(0)
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
  token: '',
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
  token: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    {
      pattern: /^\d{8}$/,
      message: '验证码必须是8位数字',
      trigger: 'blur',
    },
  ],
}
// 修改邮箱提交

const onSubmits = async () => {
  try {
    await formRefs.value.validateField(['old_email', 'new_email'])
    await userUpdateEmailService(pwdForms.value)
    ElMessage.success('验证码发送成功，请前往新邮箱查收')
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    ElMessage.error('验证码发送失败 ' + error.message)
  }
}
//校验验证码+路由跳转
const onVerify = async () => {
  loadings.value = true
  try {
    await formRefs.value.validate()
    await userVerifyEmailChangeService(pwdForms.value)
    ElMessage.success('邮箱变更成功，请使用新邮箱登录')
    userStore.logout()
  } catch (error) {
    ElMessage.error('邮箱变更失败 ' + error.message)
  } finally {
    loadings.value = false
  }
}
const onResets = () => {
  pwdForms.value.old_email = ''
  pwdForms.value.new_email = ''
  pwdForms.value.token = ''
}
</script>
<template>
  <page-container title="重置密码">
    <el-row>
      <el-col :span="11">
        <el-form :model="pwdForm" :rules="rules" ref="formRef" label-width="100px" size="large">
          <el-form-item label="原密码" prop="old_pwd">
            <el-input v-model="pwdForm.old_pwd" type="password" :prefix-icon="Lock"></el-input>
          </el-form-item>
          <el-form-item label="新密码" prop="new_pwd">
            <el-input v-model="pwdForm.new_pwd" type="password" :prefix-icon="Lock"></el-input>
          </el-form-item>
          <el-form-item label="确认新密码" prop="re_pwd">
            <el-input v-model="pwdForm.re_pwd" type="password" :prefix-icon="Lock"></el-input>
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
            <el-input v-model="pwdForms.old_email" type="email" :prefix-icon="Message"></el-input>
          </el-form-item>
          <el-form-item label="新邮箱" prop="new_email">
            <el-input v-model="pwdForms.new_email" type="email" :prefix-icon="Message"></el-input>
          </el-form-item>
          <el-form-item label="验证码" prop="token">
            <el-input
              v-model="pwdForms.token"
              :prefix-icon="Key"
              type="password"
              placeholder="请输入验证码"
              ><template #suffix>
                <el-button
                  link
                  type="primary"
                  :disabled="countdown > 0"
                  @click="onSubmits"
                  style="font-size: 13px"
                >
                  <!-- countdown的计时还没算 -->
                  {{ countdown > 0 ? `${countdown}s后重发` : '发送验证码' }}
                </el-button>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button @click="onVerify" type="primary" :loading="loadings">修改邮箱</el-button>
            <el-button @click="onResets">重置</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </page-container>
</template>
