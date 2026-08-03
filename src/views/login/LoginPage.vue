<script setup>
//引入
import { User, Lock, View, Message } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { userRegisterService, userLoginService } from '@/api/user'
import { ElMessage } from 'element-plus'
import { watch } from 'vue'
import { useRouter } from 'vue-router'
//量
const isRegister = ref(true)
const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const formModel = ref({
  username: '',
  email: '',
  password: '',
  repassword: '',
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
})
//方法和规则
const a = async (fn, msg) => {
  loading.value = true
  try {
    await formRef.value.validate()
  } catch {
    ElMessage.error('请填写完整信息')
    loading.value = false
    return false
  }
  try {
    const res = await fn(formModel.value)
    console.log(res)
    if (msg === '注册') {
      ElMessage.success('注册成功,请在邮箱中确认后登录')
    }
    ElMessage.success(msg + '成功')
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
  await a(userRegisterService, '注册')
}
const login = async () => {
  const res = await a(userLoginService, '登录')
  if (res) router.push('/')
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
        <el-form-item>
          <el-button
            :disabled="loading"
            class="button"
            type="primary"
            @click="submitForm"
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
