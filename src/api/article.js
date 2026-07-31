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
//删除文章分类
export const artDeleteChannelService = async (id) => {
  const { error } = await supabase.from('article_channel').delete().eq('id', id)
  if (error) throw new Error(error.message)
  return id
}

//获取文章列表
export const artGetListService = async (params) => {
  let res
  if (params.article_id === '') {
    res = await supabase.from('article').select()
  } else {
    res = await supabase.from('article').select().eq('article_id', params.article_id)
  }
  const { data, error } = res
  if (error) throw new Error(error.message)
  return data
}
