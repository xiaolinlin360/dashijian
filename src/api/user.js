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

// 用户验证验证码
export const userVerifyOtpService = async ({ email, token }) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email, // 这里的邮箱必须与发送验证码时的一致
    token, // 用户输入的 6 位数字码
    type: 'email',
  })
  if (error) throw new Error('验证失败:' + error.message)
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

// 更新用户昵称和头像
export const userUpdateInfoService = async (params, isFile) => {
  if (isFile) {
    const file = params.avatar
    const filrPath = `${userStore.user.id}/${Date.now()}.${file.type.split('/')[1]}`
    const { error: uploadError } = await supabase.storage.from('avatar').upload(filrPath, file, {
      cacheControl: '3600',
      upsert: false, // 不覆盖已有文件，若需覆盖改为 true
    })
    if (uploadError) throw new Error(uploadError.message)
    // 上传成功后，将文件路径赋值给 avatar 字段
    params.avatar = supabase.storage.from('avatar').getPublicUrl(filrPath).data.publicUrl
  } else {
    delete params.avatar
  }

  const { data, error } = await supabase.from('user').update(params).eq('id', userStore.user.id)
  if (error) throw new Error(error.message)
  return data
}

// 更新用户密码
export const userUpdatePasswordService = async (params) => {
  const { data, error } = await supabase.auth.updateUser({
    password: params.new_pwd,
    current_password: params.old_pwd,
  })
  if (error) throw new Error(error.message)
  return data
}

// 更新用户邮箱（向新邮箱发送验证码）
export const userUpdateEmailService = async (params) => {
  const { data, error } = await supabase.auth.updateUser({
    email: params.new_email,
  })
  if (error) throw new Error(error.message)
  return data
}

// 验证邮箱变更验证码
export const userVerifyEmailChangeService = async (params) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email: params.new_email, // 必须是新邮箱
    token: params.token, // 用户收到的 8 位验证码
    type: 'email_change', // 必须是 email_change 类型
  })

  if (error) throw new Error(error.message)
  return data
}
