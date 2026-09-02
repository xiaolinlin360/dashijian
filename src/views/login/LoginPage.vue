<script setup>
//引入
import { User, Lock, View, Message } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { userRegisterService, userLoginService, userVerifyOtpService } from '@/api/user'
import { ElMessage } from 'element-plus'
import { watch } from 'vue'
import { useRouter } from 'vue-router'
//量
const isRegister = ref(true)
const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const countdown = ref(0)
const formModel = ref({
  username: '',
  email: '',
  password: '',
  repassword: '',
  token: '',
})
const rules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 10, message: '用户名必须是3-10位的字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,
      message: '请输入正确的邮箱格式',
      trigger: 'blur',
    },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_]{6,15}$/,
      message: '密码必须是6-15位的字母、数字或下划线字符',
      trigger: 'blur',
    },
  ],
  repassword: [
    { required: true, message: '请输入再次密码', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_]{6,15}$/,
      message: '密码必须是6-15位的字母、数字或下划线字符',
      trigger: 'blur',
    },
    {
      validator: (rule, value, callback) => {
        if (value !== formModel.value.password) callback(new Error('两次密码输入密码不一致'))
        else callback()
      },
      trigger: 'blur',
    },
  ],
  token: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    {
      pattern: /^[0-9]{8}$/,
      message: '验证码必须是8位的数字',
      trigger: 'blur',
    },
  ],
})
//方法和规则
const a = async (fn, msg) => {
  loading.value = true
  try {
    await formRef.value.validateField(['email', 'password', 'username', 'repassword'])
  } catch {
    ElMessage.error('请填写完整信息')
    loading.value = false
    return false
  }
  try {
    if (msg === '注册') ElMessage.success('验证码发送成功,请检查邮箱')
    await fn(formModel.value)
    if (msg !== '注册') {
      ElMessage.success(msg + '成功')
      router.push('/')
    }
  } catch (err) {
    if (err.message === 'email rate limit exceeded') {
      ElMessage.error('邮箱注册频率过快，请稍后再试')
    } else if (err.message === 'Email not confirmed') {
      ElMessage.error('邮箱未确认，请先确认邮箱')
    } else if (err.message === 'Invalid login credentials') {
      ElMessage.error('用户名或密码错误，请重新输入')
    } else {
      ElMessage.error(msg + '失败' + err.message)
    }
    loading.value = false
    return false
  }
  loading.value = false
  return true
}
const submitForm = async () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
  await a(userRegisterService, '注册')
}
const login = async () => {
  await a(userLoginService, '登录')
}
// 校验验证码+路由跳转
const handleSendCode = async () => {
  try {
    await formRef.value.validateField(['email', 'token'])
  } catch {
    ElMessage.error('请填写完整信息')
    return false
  }
  try {
    await userVerifyOtpService(formModel.value)
    ElMessage.success('注册成功')
    isRegister.value = false
  } catch {
    ElMessage.error('验证码不正确')
    return false
  }
}
watch(
  () => isRegister.value,
  (newVal) => {
    if (newVal) {
      formModel.value = {
        username: '',
        email: '',
        password: '',
        repassword: '',
      }
    }
  },
)
</script>
<!--
 el-form：：model：xxxx, 绑定数据对象  
 el-form：：rules:xxxx, 绑定校验对象
v-model：xxxx.xxx， 双向绑定
 
-->
<template>
  <el-row class="login-page">
    <el-col :span="12" class="bg"></el-col>
    <el-col :span="6" :offset="3" class="form">
      <el-form
        ref="formRef"
        :model="formModel"
        :rules="rules"
        size="large"
        autocomplete="off"
        v-if="isRegister"
      >
        <el-form-item>
          <h1>注册</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input
            v-model="formModel.username"
            :prefix-icon="User"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <el-form-item prop="email">
          <el-input
            v-model="formModel.email"
            :prefix-icon="Message"
            placeholder="请输入邮箱"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="formModel.password"
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <el-form-item prop="repassword">
          <el-input
            v-model="formModel.repassword"
            :prefix-icon="View"
            type="password"
            placeholder="请输入再次密码"
          ></el-input>
        </el-form-item>
        <el-form-item prop="token">
          <el-input
            v-model="formModel.token"
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入验证码"
            ><template #suffix>
              <el-button
                link
                type="primary"
                :disabled="countdown > 0"
                @click="submitForm"
                style="font-size: 13px"
              >
                <!-- countdown的计时还没算 -->
                {{ countdown > 0 ? `${countdown}s后重发` : '发送验证码' }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            :disabled="loading"
            class="button"
            type="primary"
            @click="handleSendCode"
            auto-insert-space
          >
            注册
          </el-button>
        </el-form-item>
        <el-form-item class="flex">
          <el-link type="info" underline="hover" @click="isRegister = false"> ← 返回 </el-link>
        </el-form-item>
      </el-form>
      <el-form ref="formRef" size="large" autocomplete="off" v-else>
        <el-form-item>
          <h1>登录</h1>
        </el-form-item>
        <el-form-item prop="email">
          <el-input
            v-model="formModel.email"
            :prefix-icon="Message"
            placeholder="请输入邮箱"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="formModel.password"
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <el-form-item class="flex">
          <div class="flex">
            <el-checkbox>记住我</el-checkbox>
            <el-link type="primary" underline="hover">忘记密码？</el-link>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
            :disabled="loading"
            class="button"
            type="primary"
            @click="login"
            auto-insert-space
          >
            登录
          </el-button>
        </el-form-item>
        <el-form-item class="flex">
          <el-link type="info" underline="hover" @click="isRegister = true"> 注册 → </el-link>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.login-page {
  height: 100vh;
  background-color: #fff;
  .bg {
    background:
      url('@/assets/logo2.png') no-repeat 60% center / 240px auto,
      url('@/assets/login_bg.jpg') no-repeat center / cover;
    border-radius: 0 20px 20px 0;
  }
  .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    user-select: none;
    .title {
      margin: 0 auto;
    }
    .button {
      width: 100%;
    }
    .flex {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
