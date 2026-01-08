/**
 * 路由配置文件
 *
 * 【Vue Router 概念解释】
 * - createRouter: 创建路由实例的函数
 * - createWebHistory: 使用 HTML5 History 模式（URL 无 # 号）
 * - routes: 路由表，定义 URL 路径与组件的映射关系
 * - beforeEach: 全局前置守卫，每次路由跳转前执行
 */
import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/storage'

// 路由表配置
// 使用懒加载（() => import(...)）：页面组件在访问时才加载，提升首屏速度
const routes = [
  {
    path: '/',
    redirect: '/home' // 根路径重定向到首页
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/login/LoginPage.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/home',
    name: 'Home',
    // 懒加载：只有访问 /home 时才加载 HomePage 组件
    component: () => import('../pages/home/HomePage.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/workspace',
    name: 'Workspace',
    component: () => import('../pages/workspace/WorkspacePage.vue'),
    meta: { title: '工作台' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../pages/profile/ProfilePage.vue'),
    meta: { title: '我的' }
  },
  {
    path: '/workspace/quality',
    name: 'QualityFeedback',
    component: () => import('../pages/workspace/quality/QualityFeedbackPage.vue'),
    meta: { title: '质量快反' }
  },
  {
    path: '/workspace/qiandiao',
    name: 'QiandiaoFeedback',
    component: () => import('../pages/workspace/qiandiao/QiandiaoFeedbackPage.vue'),
    meta: { title: '钳调反馈' }
  },
  {
    path: '/workspace/other-worktime',
    name: 'OtherWorktime',
    component: () => import('../pages/workspace/otherWorktime/OtherWorktimePage.vue'),
    meta: { title: '其他工时' }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(), // History 模式
  routes
})

/**
 * 全局前置守卫
 * 【作用说明】
 * 在每次路由跳转前执行，用于：
 * 1. 检查用户是否已登录
 * 2. 未登录时重定向到登录页
 *
 * 【参数说明】
 * - to: 即将进入的目标路由
 * - from: 当前导航正要离开的路由
 * - next: 调用该方法来 resolve 这个钩子（Vue Router 3.x 写法，4.x 可省略）
 */
router.beforeEach((to) => {
  // 获取 token
  const token = getToken()

  // 如果目标路由明确标记不需要认证（如登录页），直接放行
  if (to.meta.requiresAuth === false) {
    return true
  }

  // 如果没有 token，重定向到登录页
  if (!token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  // 有 token，放行
  return true
})

export default router
