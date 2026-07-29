import { supabase } from '@/utils/request'

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

export const userLoginService = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw new Error(error.message)
  return data
}
