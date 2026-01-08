/**
 * 登录相关 API 封装
 *
 * 【作用说明】
 * 封装与用户认证相关的后端接口调用
 * 包括：登录、获取用户信息、退出登录
 */
import request from './request'

/**
 * 移动端登录接口
 * @param {string} username - 用户名
 * @param {string} password - 加密后的密码
 * @returns {Promise} 返回包含 token 的响应
 *
 * 【接口说明】
 * POST /loginMobile
 * 请求体：{ username, password }
 * 响应：{ token: 'xxx' }
 */
export function loginMobile(username, password) {
  return request({
    url: '/loginMobile',
    method: 'post',
    data: { username, password }
  })
}

/**
 * 获取当前登录用户信息
 * @returns {Promise} 返回用户信息
 *
 * 【接口说明】
 * GET /getInfo
 * 响应：{ user: {...}, roles: [...], permissions: [...] }
 */
export function getInfo() {
  return request({
    url: '/getInfo',
    method: 'get'
  })
}

/**
 * 退出登录
 * @returns {Promise}
 *
 * 【接口说明】
 * POST /logout
 */
export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}
