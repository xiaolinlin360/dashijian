import { supabase } from '@/utils/request'

export const userRegisterService = ({ email, password }) => {
  return supabase.auth.signUp({
    email,
    password,
  })
}
