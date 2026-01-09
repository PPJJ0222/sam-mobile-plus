/**
 * localStorage 封装工具
 *
 * 【作用说明】
 * 统一封装 localStorage 操作，用于存储 token、记住密码等数据
 * 提供 get/set/remove 方法，自动处理 JSON 序列化
 */

// Token 存储的 key
const TOKEN_KEY = "token";
// 记住密码相关的 key
const USERNAME_KEY = "username";
const PASSWORD_KEY = "password";
const REMEMBER_KEY = "rememberMe";

/**
 * 获取 Token
 * @returns {string|null} token 值
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * 设置 Token
 * @param {string} token - token 值
 */
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * 移除 Token
 */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * 获取记住的登录信息
 * @returns {Object} 包含 username, password, rememberMe 的对象
 */
export function getRememberedLogin() {
  return {
    username: localStorage.getItem(USERNAME_KEY) || "",
    password: localStorage.getItem(PASSWORD_KEY) || "",
    rememberMe: localStorage.getItem(REMEMBER_KEY) === "true",
  };
}

/**
 * 保存登录信息（记住密码功能）
 * @param {string} username - 用户名
 * @param {string} encryptedPassword - 加密后的密码
 */
export function saveRememberedLogin(username, encryptedPassword) {
  localStorage.setItem(USERNAME_KEY, username);
  localStorage.setItem(PASSWORD_KEY, encryptedPassword);
  localStorage.setItem(REMEMBER_KEY, "true");
}

/**
 * 清除记住的登录信息
 */
export function clearRememberedLogin() {
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(PASSWORD_KEY);
  localStorage.removeItem(REMEMBER_KEY);
}

/**
 * 清除所有存储（退出登录时使用）
 */
export function clearAll() {
  removeToken();
  clearRememberedLogin();
}
