-- =============================================================
--  大事件 · Big Event CMS — Supabase 数据库初始化脚本
--  Supabase Database Initialization Script
--
--  在 Supabase Dashboard → SQL Editor 中粘贴本文件并 Run 即可。
--  Paste this file into Supabase Dashboard → SQL Editor and click Run.
--  脚本可重复执行（幂等），再次运行不会报错。
--  Idempotent: safe to run multiple times.
-- =============================================================

-- -------------------------------------------------------------
-- 1. Storage Buckets（图片存储桶）
--    Article cover images & user avatars
-- -------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('cover_img', 'cover_img', true), -- 文章封面 Article covers
  ('avatar',   'avatar',   true)    -- 用户头像 User avatars
on conflict (id) do nothing;

-- 允许已登录用户向自己的目录上传 / 覆盖文件
-- Allow authenticated users to upload into their own folders
drop policy if exists "cover_img: auth upload" on storage.objects;
create policy "cover_img: auth upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'cover_img' and (storage.foldername(name))[1] = (select auth.uid()::text));

drop policy if exists "cover_img: auth update" on storage.objects;
create policy "cover_img: auth update" on storage.objects
  for update to authenticated
  using (bucket_id = 'cover_img' and (storage.foldername(name))[1] = (select auth.uid()::text));

drop policy if exists "avatar: auth upload" on storage.objects;
create policy "avatar: auth upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatar' and (storage.foldername(name))[1] = (select auth.uid()::text));

drop policy if exists "avatar: auth update" on storage.objects;
create policy "avatar: auth update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatar' and (storage.foldername(name))[1] = (select auth.uid()::text));

-- -------------------------------------------------------------
-- 2. 用户资料表 user
--    与 auth.users 一一对应，由下面的触发器自动创建行
--    Mirrors auth.users 1:1, rows auto-created by the trigger below
-- -------------------------------------------------------------
create table if not exists public.user (
  id         uuid primary key references auth.users (id) on delete cascade,
  username   text,
  email      text,
  avatar     text,
  created_at timestamptz not null default now()
);

-- 用户注册成功后自动在 user 表插入一行
-- Automatically create a user row after sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user (id, username, email)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username', -- 注册时传入的用户名 username passed at sign-up
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 行级安全：每个用户只能读写自己的资料
-- RLS: users can only read/update their own profile
alter table public.user enable row level security;

drop policy if exists "user: select own" on public.user;
create policy "user: select own" on public.user
  for select using (auth.uid() = id);

drop policy if exists "user: update own" on public.user;
create policy "user: update own" on public.user
  for update using (auth.uid() = id);

-- -------------------------------------------------------------
-- 3. 文章分类表 article_channel
-- -------------------------------------------------------------
create table if not exists public.article_channel (
  id         bigserial primary key,
  cate_name  text not null, -- 分类名称 Channel name
  cate_alias text not null, -- 分类别名 Channel alias
  user_id    uuid not null default auth.uid() references public.user (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.article_channel enable row level security;

drop policy if exists "article_channel: select own" on public.article_channel;
create policy "article_channel: select own" on public.article_channel
  for select using (auth.uid() = user_id);

drop policy if exists "article_channel: insert own" on public.article_channel;
create policy "article_channel: insert own" on public.article_channel
  for insert with check (auth.uid() = user_id);

drop policy if exists "article_channel: update own" on public.article_channel;
create policy "article_channel: update own" on public.article_channel
  for update using (auth.uid() = user_id);

drop policy if exists "article_channel: delete own" on public.article_channel;
create policy "article_channel: delete own" on public.article_channel
  for delete using (auth.uid() = user_id);

-- -------------------------------------------------------------
-- 4. 文章表 article
-- -------------------------------------------------------------
create table if not exists public.article (
  id         bigserial primary key,
  title      text not null,  -- 文章标题 Article title
  article_id bigint references public.article_channel (id) on delete cascade, -- 所属分类 Channel id
  cover_img  text,           -- 封面图公开 URL Cover image public URL
  content    text,           -- 富文本 HTML 内容 Rich-text HTML content
  state      text not null default '草稿', -- 发布状态：已发布 / 草稿 Published / Draft
  user_id    uuid not null default auth.uid() references public.user (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.article enable row level security;

drop policy if exists "article: select own" on public.article;
create policy "article: select own" on public.article
  for select using (auth.uid() = user_id);

drop policy if exists "article: insert own" on public.article;
create policy "article: insert own" on public.article
  for insert with check (auth.uid() = user_id);

drop policy if exists "article: update own" on public.article;
create policy "article: update own" on public.article
  for update using (auth.uid() = user_id);

drop policy if exists "article: delete own" on public.article;
create policy "article: delete own" on public.article
  for delete using (auth.uid() = user_id);

-- -------------------------------------------------------------
-- 5. 索引（提升列表查询性能）
--    Indexes to speed up list queries
-- -------------------------------------------------------------
create index if not exists idx_article_channel_user on public.article_channel (user_id);
create index if not exists idx_article_user on public.article (user_id);
create index if not exists idx_article_channel on public.article (article_id);
