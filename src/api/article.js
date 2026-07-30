import { supabase } from '@/utils/request'
import { useUserStore } from '@/stores/mods/user'
const userStore = useUserStore()

//获取文章分类
export const artGetChannelsService = async () => {
  const { data, error } = await supabase.from('article_channel').select()
  if (error) throw new Error(error.message)
  return data
}
//添加文章分类
export const artAddChannelService = async ({ cate_name, cate_alias }) => {
  const { error } = await supabase
    .from('article_channel')
    .insert({ cate_name, cate_alias, user_id: userStore.user.id })
  if (error) throw new Error(error.message)
  return { cate_name, cate_alias }
}
//编辑文章分类
export const artEditChannelService = async (data) => {
  const { error } = await supabase.from('article_channel').update(data).eq('id', data.id)
  if (error) throw new Error(error.message)
  return data
}
