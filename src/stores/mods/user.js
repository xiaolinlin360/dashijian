import { defineStore } from 'pinia'
import { supabase } from '@/utils/request'
import { ref } from 'vue'
import router from '@/router'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore(
  'big-user',
  () => {
    const user = ref(null)
    const getUserId = async () => {
      const data = await supabase.auth.getUser()
      user.value = data.data.user
      return data.data.user.id
    }
    const getUser = async (id) => {
      const data = await supabase.from('user').select().eq('id', id)
      if (data.error) throw new Error(data.error.message)
      user.value = { ...user.value, ...data.data[0] }
    }
    const logout = async () => {
      await supabase.auth.signOut()
      user.value = null
      router.push('/login')
      ElMessage.success('退出成功')
    }
    return {
      user,
      getUserId,
      getUser,
      logout,
    }
  },
  {
    persist: true,
  },
)
