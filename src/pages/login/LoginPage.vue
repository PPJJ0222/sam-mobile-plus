<!--
  登录页面组件

  【组件说明】
  移动端登录页面，包含：
  - 顶部蓝色渐变背景 + Logo + 系统名称
  - 白色圆角卡片表单
  - 账号密码输入框
  - 记住密码功能
  - RSA 密码加密

  【设计说明】
  - 使用蓝色渐变背景营造专业感
  - 白色卡片悬浮效果增加层次感
  - 页面进入时有淡入动画
-->
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showLoadingToast, closeToast } from 'vant'
import { useUserStore } from '@/stores/user'
import { encrypt, decrypt } from '@/utils/crypto'
import { getRememberedLogin, saveRememberedLogin, clearRememberedLogin } from '@/utils/storage'

// 获取路由实例，用于登录成功后跳转
const router = useRouter()
// 获取用户 Store，用于调用登录方法
const userStore = useUserStore()

/**
 * 表单数据
 * 【ref 解释】ref() 创建响应式变量，值变化时视图自动更新
 */
const username = ref('')
const password = ref('')
const rememberMe = ref(false)

// 密码是否可见（控制密码框显示/隐藏）
const showPassword = ref(false)

// 页面是否显示（用于进入动画）
const pageVisible = ref(false)

/**
 * 组件挂载时执行
 * 【onMounted 解释】Vue 生命周期钩子，组件挂载到 DOM 后执行
 *
 * 【功能说明】
 * 1. 读取记住的登录信息
 * 2. 触发页面进入动画
 */
onMounted(() => {
  // 读取记住的登录信息
  const remembered = getRememberedLogin()
  if (remembered.rememberMe) {
    username.value = remembered.username
    // 解密存储的密码
    const decryptedPassword = decrypt(remembered.password)
    if (decryptedPassword) {
      password.value = decryptedPassword
    }
    rememberMe.value = true
  }

  // 延迟显示页面，触发进入动画
  setTimeout(() => {
    pageVisible.value = true
  }, 100)
})

/**
 * 处理登录
 * 【流程说明】
 * 1. 表单验证
 * 2. 密码 RSA 加密
 * 3. 调用登录接口
 * 4. 处理记住密码
 * 5. 获取用户信息
 * 6. 跳转首页
 */
const handleLogin = async () => {
  // 表单验证
  if (!username.value.trim()) {
    showToast('请输入账号')
    return
  }
  if (!password.value) {
    showToast('请输入密码')
    return
  }

  // 显示加载提示
  showLoadingToast({
    message: '登录中...',
    forbidClick: true,
    duration: 0
  })

  try {
    // 密码 RSA 加密
    const encryptedPassword = encrypt(password.value)
    if (!encryptedPassword) {
      closeToast()
      showToast('密码加密失败')
      return
    }

    // 调用登录接口
    await userStore.login(username.value.trim(), encryptedPassword)

    // 处理记住密码
    if (rememberMe.value) {
      // 保存加密后的密码到本地
      saveRememberedLogin(username.value.trim(), encryptedPassword)
    } else {
      clearRememberedLogin()
    }

    // 获取用户信息
    await userStore.fetchUserInfo()

    closeToast()
    showToast('登录成功')

    // 跳转首页
    router.replace('/home')
  } catch (error) {
    closeToast()
    // 错误已在 request.js 中统一处理
    console.error('登录失败:', error)
  }
}
</script>

<template>
  <!-- 登录页容器，使用 v-show 控制显示以触发动画 -->
  <div class="login-page" :class="{ visible: pageVisible }">
    <!-- 顶部渐变背景区域 -->
    <div class="header-bg">
      <!-- 装饰圆形 -->
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>

      <!-- Logo 和系统名称 -->
      <div class="logo-area">
        <img src="@/assets/logo.png" alt="Logo" class="logo-img" />
        <h1 class="system-name">SAM移动+</h1>
      </div>
    </div>

    <!-- 登录表单卡片 -->
    <div class="login-card">
      <!--
        Vant 表单组件
        【van-form 说明】
        - @submit: 表单提交事件（通过验证后触发）
      -->
      <van-form @submit="handleLogin">
        <!--
          账号输入框
          【van-field 说明】
          - v-model: 双向绑定输入值
          - label: 左侧标签
          - placeholder: 占位提示文字
          - left-icon: 左侧图标
          - clearable: 显示清除按钮
        -->
        <van-field v-model="username" label="账号" placeholder="请输入账号" left-icon="user-o" clearable
          autocomplete="username" />

        <!--
          密码输入框
          【说明】
          - type: password 时隐藏密码，text 时显示密码
          - right-icon: 右侧图标，点击切换密码显示/隐藏
        -->
        <van-field v-model="password" :type="showPassword ? 'text' : 'password'" label="密码" placeholder="请输入密码"
          left-icon="lock" :right-icon="showPassword ? 'eye-o' : 'closed-eye'"
          @click-right-icon="showPassword = !showPassword" autocomplete="current-password" />

        <!-- 记住密码复选框 -->
        <div class="remember-row">
          <!--
            Vant 复选框
            【van-checkbox 说明】
            - v-model: 绑定选中状态（true/false）
            - shape="square": 方形复选框
          -->
          <van-checkbox v-model="rememberMe" shape="square">记住密码</van-checkbox>
        </div>

        <!-- 登录按钮 -->
        <div class="submit-btn-wrapper">
          <!--
            Vant 按钮
            【说明】
            - type="primary": 主要按钮样式（蓝色）
            - block: 块级按钮（宽度 100%）
            - native-type="submit": 原生 submit 类型，触发表单提交
          -->
          <van-button type="primary" block native-type="submit" class="login-btn">
            登 录
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<style scoped>
/* 登录页容器 */
.login-page {
  background-color: #f5f5f5;
  /* 进入动画：初始状态透明 */
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

/* 页面可见时的状态 */
.login-page.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 顶部渐变背景 */
.header-bg {
  height: 280px;
  /* 蓝色渐变背景 */
  background: linear-gradient(135deg, #1989fa 0%, #4facfe 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 装饰圆形 */
.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: -50px;
  right: -50px;
}

.circle-2 {
  width: 150px;
  height: 150px;
  bottom: -30px;
  left: -30px;
}

/* Logo 区域 */
.logo-area {
  text-align: center;
  z-index: 1;
}

.logo-img {
  width: 120px;
  height: 60px;
  border-radius: 16px;
  background: white;
  padding: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.system-name {
  color: white;
  font-size: 24px;
  font-weight: 500;
  margin-top: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 登录表单卡片 */
.login-card {
  margin: -40px 20px 0;
  padding: 30px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 2;
}

/* 记住密码行 */
.remember-row {
  padding: 16px 16px 0;
}

/* 登录按钮容器 */
.submit-btn-wrapper {
  padding: 24px 16px 0;
}

/* 登录按钮样式 */
.login-btn {
  height: 44px;
  border-radius: 22px;
  font-size: 16px;
  /* 按钮点击缩放效果 */
  transition: transform 0.1s ease;
}

.login-btn:active {
  transform: scale(0.98);
}

/* 覆盖 Vant Field 样式 */
:deep(.van-field) {
  padding: 12px 16px;
}

:deep(.van-field__label) {
  width: 50px;
}
</style>
