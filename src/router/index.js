import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    meta: {},
    component: () => import('@/views/home'),
  },
  {
    path: '/login',
    name: 'Login',
    meta: {
      isWindow: true
    },
    component: () => import('@/views/login')
  },
  {
    path: '/list',
    name: 'List',
    meta: {},
    component: () => import('@/views/list')
  },
  {
    path: '/window/avatar',
    name: 'WinAvatar',
    meta: {
      isWindow: true
    },
    component: () => import('@/views/window/avatar')
  },
  {
    path: '/window/card',
    name: 'WinCard',
    meta: {
      isWindow: true
    },
    component: () => import('@/views/window/card')
  },
  {
    path: '/window/media',
    name: 'WinMedia',
    meta: {
      isWindow: true
    },
    component: () => import('@/views/window/media')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
