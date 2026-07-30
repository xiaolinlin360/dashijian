import { supabase } from '@/utils/request'
import { useUserStore } from '@/stores/mods/user'
const userStore = useUserStore()
//获取文章分类
export const artGetChannelsService = async () => {
  const { data, error } = await supabase.from('article_channel').select()
  if (error) throw new Error(error.message)
  return data
}
