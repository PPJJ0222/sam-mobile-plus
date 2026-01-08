/**
 * 用户状态管理 Store
 *
 * 【作用说明】
 * 使用 Pinia 管理用户相关的全局状态
 * 包括：token、用户信息、角色权限等
 *
 * 【Pinia 概念解释】
 * - defineStore: 定义一个 store（状态仓库）
 * - state: 存储的数据（类似 Vue 组件的 data）
 * - actions: 修改数据的方法（可以是异步的）
 * - getters: 计算属性（基于 state 派生的数据）
 */
import { defineStore } from 'pinia'
import { loginMobile, getInfo, logout } from '@/api/auth'
import { getToken, setToken, removeToken, clearAll } from '@/utils/storage'

/**
 * 用户 Store
 *
 * 【使用方式】
 * import { useUserStore } from '@/stores/user'
 * const userStore = useUserStore()
 * userStore.login(username, password)
 */
export const useUserStore = defineStore('user', {
  /**
   * state: 存储的数据
   * 【说明】token 初始值从 localStorage 读取，实现页面刷新后保持登录状态
   */
  state: () => ({
    // 用户 token，用于接口认证
    token: getToken() || '',
    // 用户基本信息
    userInfo: null,
    // 用户角色列表
    roles: [],
    // 用户权限列表
    permissions: []
  }),

  /**
   * getters: 计算属性
   */
  getters: {
    // 是否已登录（有 token 即视为已登录）
    isLoggedIn: (state) => !!state.token
  },

  /**
   * actions: 修改数据的方法
   */
  actions: {
    /**
     * 登录
     * @param {string} username - 用户名
     * @param {string} encryptedPassword - 加密后的密码
     * @returns {Promise}
     *
     * 【流程说明】
     * 1. 调用登录接口
     * 2. 保存 token 到 state 和 localStorage
     */
    async login(username, encryptedPassword) {
      const res = await loginMobile(username, encryptedPassword)
      // 调试：打印后端返回的数据结构
      console.log('登录接口返回数据:', res)
      // 保存 token
      this.token = res.token
      setToken(res.token)
      return res
    },

    /**
     * 获取用户信息
     * @returns {Promise} 用户信息
     *
     * 【流程说明】
     * 1. 调用获取用户信息接口
     * 2. 保存用户信息、角色、权限到 state
     */
    async fetchUserInfo() {
      const res = await getInfo()
      // 保存用户信息
      this.userInfo = res.user
      // 保存角色（如果没有角色，给一个默认角色）
      this.roles = res.roles && res.roles.length > 0 ? res.roles : ['ROLE_DEFAULT']
      // 保存权限
      this.permissions = res.permissions || []
      return res
    },

    /**
     * 退出登录
     * @returns {Promise}
     *
     * 【流程说明】
     * 1. 调用退出接口
     * 2. 清空 state 中的用户数据
     * 3. 清空 localStorage 中的数据
     */
    async logoutAction() {
      try {
        await logout()
      } finally {
        // 无论接口是否成功，都清空本地数据
        this.resetState()
      }
    },

    /**
     * 重置状态（清空所有用户数据）
     * 【使用场景】退出登录、token 过期时调用
     */
    resetState() {
      this.token = ''
      this.userInfo = null
      this.roles = []
      this.permissions = []
      clearAll()
    }
  }
})
