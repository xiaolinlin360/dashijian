import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/utils/request'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/login/LoginPage.vue'),
    },
    {
      path: '/',
      component: () => import('@/views/layout/LayoutContainer.vue'),
      redirect: '/article/channel',
      children: [
        {
          path: '/article/manage',
          component: () => import('@/views/article/ArticleManage.vue'),
        },
        {
          path: '/article/channel',
          component: () => import('@/views/article/ArticleChannel.vue'),
        },
        {
          path: '/user/password',
          component: () => import('@/views/user/UserPassword.vue'),
        },
        {
          path: '/user/profile',
          component: () => import('@/views/user/UserProfile.vue'),
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  // 1. 获取当前会话
  const data = await supabase.auth.getSession()
  if (!data.data.session && to.path !== '/login') return '/login'
  if (data.data.session && to.path === '/login') return '/'
})
export default router
