import { supabase } from '@/utils/request'
import { useUserStore } from '@/stores/mods/user'
const userStore = useUserStore()

// 用户注册
export const userRegisterService = async ({ email, password, username }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username, // 传递给触发器
        // 可以添加更多字段，如 avatar，但在触发器里也要相应提取
      },
    },
  })

  if (error) throw new Error(error.message)
  return data // 此时 public.user 已经自动插入了
}

// 用户登录
export const userLoginService = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw new Error(error.message)
  return data
}

//获取用户信息
export const userGetInfoService = async () => {
  const user = userStore.user

  if (!user) throw new Error('用户未登录')

  const { data, error } = await supabase.from('user').select().eq('id', user.id)
  if (error) throw new Error(error.message)

  return data
}
