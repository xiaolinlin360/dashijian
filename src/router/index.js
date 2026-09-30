import { createRouter, createWebHashHistory } from 'vue-router'
import { supabase } from '@/utils/request'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('@/views/login/LoginPage.vue'),
    },
    {
      path: '/LQX',
      component: () => import('@/views/login/LQX.vue'),
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
        {
          path: '/user/Grape',
          component: () => import('@/views/user/UserGrape.vue'),
        },
      ],
    },
  ],
})
router.beforeEach(async (to) => {
  const { data } = await supabase.auth.getSession()
  console.log(to.path)

  // 白名单：直接放行，不返回任何值（或 return true）
  if (to.path === '/login' || to.path === '/LQX') {
    return true
  }

  // 未登录 → 跳转登录页
  if (!data.session) {
    return '/login'
  }

  // 已登录访问其他页面 → 放行
  return true
})
export default router
