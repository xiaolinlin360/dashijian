import { supabase } from '@/utils/request'
import { useUserStore } from '@/stores/mods/user'
import { paginate } from '@/utils/paginate'

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
  //天才般的筛选条件
  let query = supabase.from('article').select()
  if (params.article_id) query = query.eq('article_id', params.article_id)
  if (params.state) query = query.eq('state', params.state)
  const res = await query

  const { data, error } = res
  if (error) throw new Error(error.message)
  // 分页处理
  const pageData = paginate(data, params.pagesize, params.pagenum)
  return {
    total: data.length,
    pageList: pageData,
  }
}

//添加文章和编辑文章
export const artAddService = async (params) => {
  params.user_id = userStore.user.id

  if (params.id) {
    console.log('编辑文章')
  } else {
    console.log('添加文章')
    const file = params.cover_img
    const filrPath = `${userStore.user.id}/${params.article_id}/${Date.now()}.${file.type.split('/')[1]}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cover_img')
      .upload(filrPath, file, {
        cacheControl: '3600',
        upsert: false, // 不覆盖已有文件，若需覆盖改为 true
      })
    if (uploadError) throw new Error(uploadError.message)
    // 上传成功后，将文件路径赋值给 cover_img 字段
    params.cover_img = supabase.storage.from('cover_img').getPublicUrl(filrPath).data.publicUrl
    console.log(params)

    const { data, error } = await supabase.from('article').insert(params)
    if (error) throw new Error(error.message)
    return data
  }
  // return data
}
