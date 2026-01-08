/**
 * HTTP 请求封装
 *
 * 【作用说明】
 * 统一封装 axios 请求，配置 baseURL、超时时间、拦截器等
 * 所有 API 调用都通过这个实例发起，便于统一管理
 */
import axios from "axios";
import { showToast } from "vant";
import { getToken, removeToken } from "@/utils/storage";
import router from "@/router";

// 创建 axios 实例
// baseURL: 所有请求的基础路径，实际请求地址 = baseURL + 接口路径
// 【环境变量说明】
// - 开发环境（npm run dev）：使用 .env.development 中的 /api，通过 Vite 代理转发
// - 生产环境（npm run build）：使用 .env.production 中的实际后端地址
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000, // 超时时间 30 秒
});

/**
 * 请求拦截器
 * 在请求发送前执行，添加 token 到请求头
 */
request.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = getToken();
    if (token) {
      // 添加 Authorization 请求头
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 * 在收到响应后执行，统一处理错误
 */
request.interceptors.response.use(
  (response) => {
    const res = response.data;

    // 检查业务状态码（后端返回 code: 200 表示成功）
    if (res.code !== undefined && res.code !== 200) {
      // 业务错误：显示错误信息
      showToast(res.msg || "请求失败");
      return Promise.reject(new Error(res.msg || "请求失败"));
    }

    // 成功：返回响应数据
    return res;
  },
  (error) => {
    // 获取响应状态码
    const status = error.response?.status;

    // 401 未授权：token 过期或无效
    if (status === 401) {
      // 清除本地 token
      removeToken();
      // 提示用户
      showToast("登录已过期，请重新登录");
      // 跳转到登录页
      router.push("/login");
      return Promise.reject(error);
    }

    // 其他错误：统一提示
    const message =
      error.response?.data?.msg ||
      error.response?.data?.message ||
      "网络请求失败";
    showToast(message);
    return Promise.reject(error);
  }
);

export default request;
