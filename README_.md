# 大事件 · Supabase 接入与 API 实战笔记

> 本项目由黑马程序员「大事件」教学项目改造而来：把原来的自建后端（Node/Express 接口）**整体替换为 Supabase**，前端技术栈保持不变。
> 这份文档是 Supabase 版本的完整学习笔记 —— 从 SDK 接入、数据库初始化，到 Auth / Database / Storage 三大 API 的逐一讲解，并附上本项目里真实可运行的封装代码。

- 在线体验：https://dashijian.vercel.app
- 数据库初始化脚本：[supabase/schema.sql](supabase/schema.sql)

---

## 目录

1. [Supabase 是什么](#一supabase-是什么)
2. [接入 Supabase SDK（7 步）](#二接入-supabase-sdk7-步)
3. [数据库设计](#三数据库设计)
4. [Auth 认证 API](#四auth-认证-api)
5. [Database 数据库 API](#五database-数据库-api)
6. [Storage 存储 API](#六storage-存储-api)
7. [Pinia 用户状态 + 路由守卫](#七pinia-用户状态--路由守卫)
8. [前端分页技巧](#八前端分页技巧)
9. [常见错误与踩坑记录](#九常见错误与踩坑记录)
10. [参考链接](#十参考链接)

---

## 一、Supabase 是什么

Supabase 是一个开源的 **BaaS（Backend as a Service，后端即服务）** 平台，基于 PostgreSQL 构建。它把传统后端的四件事全部包办了：

| 传统后端 | Supabase 对应能力 | 本项目用途 |
| --- | --- | --- |
| 登录注册 / Token | **Auth**（邮箱密码、OAuth、JWT） | 注册 / 登录 / 改密 / 换邮箱 |
| 数据库 + 接口 | **PostgreSQL** + PostgREST（`supabase.from('表名')`） | 文章、分类、用户资料 |
| 文件服务器 | **Storage**（对象存储） | 封面图、头像上传 |
| 权限控制 | **RLS（Row Level Security）行级安全** | 每个用户只能访问自己的数据 |

> 核心心智：**不需要写后端接口**。前端直接 `supabase.auth.xxx()`、`supabase.from('表').xxx()` 就能完成全部数据操作，安全由数据库层的 RLS 策略保证。

---

## 二、接入 Supabase SDK（7 步）

### 第 1 步：创建 Supabase 项目

1. 打开 https://supabase.com 注册账号
2. 点击 **New Project**，填写项目名（例如 `big-event`）和数据库密码
3. 选择离你最近的 Region，点击 **Create**，等待约 2 分钟初始化完成

### 第 2 步：获取 URL 和 anon key

进入 **Project Settings → API**：

- **Project URL**：形如 `https://xxxxxxxx.supabase.co`
- **anon public key**：一个公开的 key（新版叫 `sb_publishable_...`）

> ⚠️ 这里拿到的 **anon key** 是可以公开的（数据安全由 RLS 保证）；**service_role key 是最高权限密钥，绝不能提交进仓库！**

### 第 3 步：安装 SDK

```bash
pnpm add @supabase/supabase-js
```

### 第 4 步：初始化 Supabase 客户端

新建 `src/utils/request.js`（本项目把 Supabase 客户端单例放在这里，全局复用）：

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 第 5 步：配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxx
```

Vite 会自动把 `VITE_` 开头的变量注入到 `import.meta.env`，供第 4 步读取。

### 第 6 步：初始化数据库

在 Supabase Dashboard → **SQL Editor** 中粘贴 [supabase/schema.sql](supabase/schema.sql) 并点击 **Run**。这一步会完成：

- 建表：`user` / `article_channel` / `article`
- 创建触发器：用户注册成功后自动在 `user` 表创建档案行
- 开启全部表的 RLS 行级安全策略
- 创建 `cover_img`、`avatar` 两个公开存储桶

### 第 7 步：验证

```bash
pnpm dev
```

打开 http://localhost:5173 ，注册一个账号，看能否正常登录并进入首页 —— 至此 SDK 接入完成。

---

## 三、数据库设计

本项目只有 3 张业务表，关系如下：

```
auth.users（Supabase 内置）  ──1:1──►  public.user（用户资料，触发器自动创建）
public.user ──1:N──► public.article_channel（文章分类）
public.user ──1:N──► public.article（文章）
public.article_channel ──1:N──► public.article（所属分类）
```

| 表 | 关键字段 | 说明 |
| --- | --- | --- |
| `user` | `id`(uuid=auth.users.id)、`username`、`email`、`avatar` | 注册时由触发器自动插入一行 |
| `article_channel` | `cate_name`、`cate_alias`、`user_id` | 分类名称 / 别名，按用户隔离 |
| `article` | `title`、`article_id`(分类)、`cover_img`、`content`、`state` | `state` 取 `已发布` / `草稿` |

### 注册触发器

这是 Supabase 最常见的模式 —— 用 `security definer` 触发器把 `auth.users` 同步到业务表：

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user (id, username, email)
  values (new.id, new.raw_user_meta_data ->> 'username', new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

> 前端注册时把用户名放进 `options.data`，触发器用 `new.raw_user_meta_data ->> 'username'` 取出来，见下文 Auth 部分。

### RLS 行级安全（数据隔离的核心）

所有表都开启了 RLS，例如文章表：

```sql
alter table public.article enable row level security;

create policy "article: select own" on public.article
  for select using (auth.uid() = user_id);

create policy "article: insert own" on public.article
  for insert with check (auth.uid() = user_id);
```

含义：**任何人拿 anon key 都只能查到 `user_id = 自己的 uid` 的行**。这就是为什么 anon key 可以公开却不怕数据泄露。

---

## 四、Auth 认证 API

全部封装在 [src/api/user.js](src/api/user.js)。

### 4.1 注册（邮箱 + 密码 + 用户名）

```js
export const userRegisterService = async ({ email, password, username }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username }, // 存入 user_metadata，供触发器读取
    },
  })
  if (error) throw new Error(error.message)
  return data // 注册成功后 public.user 已被触发器自动插入
}
```

要点：
- 免费项目默认要求**邮箱确认**，注册后要去邮箱点确认链接才能登录
- 想免验证：Supabase → Auth → Providers → Email，关闭 **Confirm email**

### 4.2 登录

```js
export const userLoginService = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  return data
}
```

登录成功后 SDK 自动管理 access token，后续所有请求都会自动带上身份，**无需手动存储 token**（不过本项目仍用 Pinia 持久化了用户信息，见第七节）。

### 4.3 获取当前用户 / 会话

```js
// 获取用户（包含 JWT 里的基本信息）
const { data } = await supabase.auth.getUser()

// 获取会话（用于路由守卫判断是否已登录）
const { data } = await supabase.auth.getSession()
```

### 4.4 修改密码

```js
export const userUpdatePasswordService = async (params) => {
  const { data, error } = await supabase.auth.updateUser({
    password: params.new_pwd,
    current_password: params.old_pwd, // 需要校验原密码
  })
  if (error) throw new Error(error.message)
  return data
}
```

### 4.5 更换邮箱（双重确认）

```js
export const userUpdateEmailService = async (params) => {
  const { data, error } = await supabase.auth.updateUser({
    email: params.new_email,
    nonce: params.old_email, // 原邮箱作为 nonce，双邮箱都要确认
  })
  if (error) throw new Error(error.message)
  return data
}
```

### 4.6 退出登录

```js
const logout = async () => {
  await supabase.auth.signOut()
  user.value = null
  router.push('/login')
  ElMessage.success('退出成功')
}
```

### 4.7 登录页的错误处理

Supabase 的错误信息是英文的，登录页做了人性化翻译（[src/views/login/LoginPage.vue](src/views/login/LoginPage.vue)）：

```js
if (err.message === 'email rate limit exceeded') {
  ElMessage.error('邮箱注册频率过快，请稍后再试')
} else if (err.message === 'Email not confirmed') {
  ElMessage.error('邮箱未确认，请先确认邮箱')
} else if (err.message === 'Invalid login credentials') {
  ElMessage.error('用户名或密码错误，请重新输入')
}
```

---

## 五、Database 数据库 API

核心用法：`supabase.from('表名').操作()...链式条件()`，返回 `{ data, error }`，**永远要判断 error**。

全部封装在 [src/api/article.js](src/api/article.js)。

### 5.1 查询 select

```js
export const artGetChannelsService = async () => {
  const { data, error } = await supabase.from('article_channel').select()
  if (error) throw new Error(error.message)
  return data
}
```

### 5.2 插入 insert

```js
export const artAddChannelService = async ({ cate_name, cate_alias }) => {
  const { error } = await supabase
    .from('article_channel')
    .insert({ cate_name, cate_alias, user_id: userStore.user.id })
  if (error) throw new Error(error.message)
  return { cate_name, cate_alias }
}
```

### 5.3 更新 update

```js
export const artEditChannelService = async (data) => {
  const { error } = await supabase.from('article_channel').update(data).eq('id', data.id)
  if (error) throw new Error(error.message)
  return data
}
```

### 5.4 删除 delete

```js
export const artDeleteChannelService = async (id) => {
  const { error } = await supabase.from('article_channel').delete().eq('id', id)
  if (error) throw new Error(error.message)
  return id
}
```

### 5.5 链式筛选（文章列表 + 条件搜索）

Supabase 的查询支持**链式调用**，按条件逐条追加筛选：

```js
export const artGetListService = async (params) => {
  let query = supabase.from('article').select()
  if (params.article_id) query = query.eq('article_id', params.article_id) // 按分类筛选
  if (params.state) query = query.eq('state', params.state)                 // 按状态筛选
  const res = await query

  const { data, error } = res
  if (error) throw new Error(error.message)
  // 拿到全部符合条件的数据后，再在前端分页
  const pageData = paginate(data, params.pagesize, params.pagenum)
  return { total: data.length, pageList: pageData }
}
```

### 5.6 统一错误处理模式

本项目把每个接口的错误都统一 `throw new Error(error.message)`，页面用 `try/catch` + `ElMessage` 提示，职责清晰：

```js
try {
  await artDeleteService(row.id)
  ElMessage.success('删除成功')
  getArticleList()
} catch (error) {
  ElMessage.error('您已取消删除或删除失败')
  console.log(error)
}
```

---

## 六、Storage 存储 API

图片上传分三步：**选文件 → upload 到 bucket → 取公开 URL 存入数据库字段**。

### 6.1 上传头像（`avatar` bucket）

```js
export const userUpdateInfoService = async (params, isFile) => {
  if (isFile) {
    const file = params.avatar
    // 路径按 user_id 组织，天然隔离不同用户
    const filrPath = `${userStore.user.id}/${Date.now()}.${file.type.split('/')[1]}`
    const { error: uploadError } = await supabase.storage.from('avatar').upload(filrPath, file, {
      cacheControl: '3600',
      upsert: false, // 不覆盖已有文件，若需覆盖改为 true
    })
    if (uploadError) throw new Error(uploadError.message)
    // 上传成功后拿到公开访问地址，存进数据库
    params.avatar = supabase.storage.from('avatar').getPublicUrl(filrPath).data.publicUrl
  } else {
    delete params.avatar
  }

  const { data, error } = await supabase.from('user').update(params).eq('id', userStore.user.id)
  if (error) throw new Error(error.message)
  return data
}
```

### 6.2 上传文章封面（`cover_img` bucket）

和头像几乎一样，只是路径里多了一层分类 id：

```js
const filrPath = `${userStore.user.id}/${params.article_id}/${Date.now()}.${file.type.split('/')[1]}`
const { error: uploadError } = await supabase.storage.from('cover_img').upload(filrPath, file, {
  cacheControl: '3600',
  upsert: false,
})
if (uploadError) throw new Error(uploadError.message)
params.cover_img = supabase.storage.from('cover_img').getPublicUrl(filrPath).data.publicUrl
```

### 6.3 Storage 的 RLS 策略

只允许已登录用户向**自己的目录**（路径第一段 = 自己的 uid）上传：

```sql
create policy "cover_img: auth upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'cover_img' and (storage.foldername(name))[1] = (select auth.uid()::text));
```

---

## 七、Pinia 用户状态 + 路由守卫

### 7.1 用户仓库（[src/stores/mods/user.js](src/stores/mods/user.js)）

Pinia 保存整个用户对象，`persist: true` 自动持久化到 localStorage：

```js
export const useUserStore = defineStore(
  'big-user',
  () => {
    const user = ref(null)

    // 从 JWT 拿用户 id
    const getUserId = async () => {
      const data = await supabase.auth.getUser()
      user.value = data.data.user
      return data.data.user.id
    }

    // 从 user 表拿完整资料（用户名、头像…）
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

    return { user, getUserId, getUser, logout }
  },
  { persist: true }
)
```

### 7.2 路由守卫（[src/router/index.js](src/router/index.js)）

`beforeEach` 里调 `supabase.auth.getSession()` 判断登录态，未登录一律打回登录页：

```js
router.beforeEach(async (to) => {
  const data = await supabase.auth.getSession()
  if (!data.data.session && to.path !== '/login') return '/login'
  if (data.data.session && to.path === '/login') return '/'
})
```

---

## 八、前端分页技巧

Supabase 免费版支持数据库端分页（`.range()`），但本项目为了简单直接**把符合条件的数据全部查出，再用工具函数在前端切片**：

```js
// src/utils/paginate.js
export function paginate(array, pageSize, pageNumber) {
  if (!Array.isArray(array) || pageSize <= 0 || pageNumber < 1) return []
  const startIndex = (pageNumber - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, array.length)
  if (startIndex >= array.length) return []
  return array.slice(startIndex, endIndex)
}
```

在文章管理页组合使用（[src/views/article/ArticleManage.vue](src/views/article/ArticleManage.vue)）：

```js
const getArticleList = async () => {
  loading.value = true
  articleList.value = await artGetListService(formModel.value)
  total.value = articleList.value.total
  articleList.value = articleList.value.pageList
  loading.value = false
}
```

> 💡 数据量大时建议改用 Supabase 的数据库端分页：`.order('created_at', { ascending: false }).range((page-1)*size, page*size-1)`，再配合 `count` 拿到总数。

---

## 九、常见错误与踩坑记录

| 报错信息 | 原因 | 解决办法 |
| --- | --- | --- |
| `Email not confirmed` | 邮箱未确认 | 去邮箱点确认链接，或关闭 Confirm email |
| `Invalid login credentials` | 账号或密码错误 | 检查邮箱/密码 |
| `email rate limit exceeded` | 注册/发送邮件太频繁 | 稍等片刻再试 |
| 查询返回空数据 | 触发了 RLS，看不到别人数据 | 检查当前用户是否已登录 |
| `row level security ... no policy` | 忘了配 RLS 策略 | 补上对应表的 policy |
| 图片上传 401 | Storage 策略未配置 | 检查存储桶的 policy / bucket 是否 public |
| 注册后 `user` 表没数据 | 触发器没建 | 重新执行 schema.sql |
| 刷新页面掉登录 | 用了内存态没走 SDK | 用 `supabase.auth.getSession()` 恢复会话 |

---

## 十、参考链接

- Supabase 官方文档：https://supabase.com/docs
- supabase-js API：https://supabase.com/docs/reference/javascript
- 数据库初始化脚本：[supabase/schema.sql](supabase/schema.sql)
- 主 README：[README.md](README.md)

---

> 这份笔记来自「大事件」项目改造过程的实践总结。如果对你有帮助，欢迎到 [主仓库](README.md) 点个 Star ⭐
