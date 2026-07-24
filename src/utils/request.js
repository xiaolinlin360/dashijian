import axios from 'axios'
import { useUserStore } from '@/stores'
import { ElMessage } from 'element-plus'
import router from '@/router'

const baseURL = 'http://big-event-vue-api-t.itheima.net'
const userStore = useUserStore()

const instance = axios.create({
  // TODO 1. 基础地址，超时时间
  baseURL,
  timeout: 5000,
})

instance.interceptors.request.use(
  (config) => {
    // TODO 2. 携带token
    if (userStore.token) {
      config.headers.Authorization = userStore.token
    }
    return config
  },
  (err) => Promise.reject(err),
)

instance.interceptors.response.use(
  (res) => {
    // TODO 3. 处理业务失败
    // TODO 4. 摘取核心响应数据
    if (res.data.code === 0) {
      return res
    }
    ElMessage.error('请求失败：' + res.data.message || '未知错误')
    return Promise.reject(res.data.message || '未知错误')
  },
  (err) => {
    // TODO 5. 处理401错误
    if (err.response.status === 401) {
      userStore.removeToken()
      ElMessage.error('登录过期，请重新登录')
      router.push('/login')
      return Promise.reject(err)
    } else {
      ElMessage.error('请求失败：' + err.response.data.message || '未知错误')
      return Promise.reject(err)
    }
  },
)

export default instance
