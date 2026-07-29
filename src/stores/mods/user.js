import { defineStore } from 'pinia'
import { supabase } from '@/utils/request'
import { ref } from 'vue'

export const useUserStore = defineStore(
  'big-user',
  () => {
    const user = ref(null)
    const getUserId = async () => {
      const data = await supabase.auth.getUser()
      return data.data.user.id
    }
    const getUser = async (id) => {
      const data = await supabase.from('user').select().eq('id', id)
      if (data.error) throw new Error(data.error.message)
      user.value = data.data[0]
    }
    return {
      user,
      getUserId,
      getUser,
    }
  },
  {
    persist: true,
  },
)
