<!--
  根组件 App.vue

  职责：
  1. 提供页面容器（router-view 显示当前路由对应的页面）
  2. 提供底部导航栏（van-tabbar）
  3. 登录页隐藏底部导航栏

  【Vue 概念解释】
  - <router-view>: 路由出口，显示当前路由匹配的组件
  - v-model: 双向绑定，这里绑定当前选中的 tab
  - computed: 计算属性，基于响应式数据派生出新值
-->
<script setup>
import { ref, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getToken } from "@/utils/storage";

// 获取路由实例，用于编程式导航
const router = useRouter();
// 获取当前路由信息
const route = useRoute();

/**
 * 当前激活的 tab 名称
 * 【ref 解释】ref() 创建一个响应式变量，值变化时视图自动更新
 */
const activeTab = ref("home");

/**
 * 是否显示底部导航栏
 * 【computed 解释】计算属性，当 route.path 变化时自动重新计算
 * 【逻辑说明】
 * 1. 登录页不显示底部导航栏
 * 2. 未登录（无 token）时也不显示，避免刷新时闪烁
 */
const showTabbar = computed(() => {
  return route.path !== '/login' && !!getToken()
})

// 根据路径前缀推断应激活的底部 tab（支持子路由）
const resolveTabByPath = (path) => {
  if (path.startsWith("/workspace")) return "workspace";
  if (path.startsWith("/profile")) return "profile";
  return "home";
};

/**
 * 监听路由变化，同步更新 activeTab
 * 【watch 解释】
 * - 为什么存在：当用户通过浏览器前进/后退按钮切换页面时，需要同步底部导航状态
 * - 监听对象：route.path（当前路由路径）
 * - 触发时机：路由路径变化时
 */
watch(
  () => route.path,
  (newPath) => {
    activeTab.value = resolveTabByPath(newPath);
  },
  { immediate: true } // 立即执行一次，初始化 activeTab
);

/**
 * 切换 tab 时跳转路由
 * @param {string} name - tab 名称
 */
const onTabChange = (name) => {
  const tabToPath = {
    home: "/home",
    workspace: "/workspace",
    profile: "/profile",
  };
  router.push(tabToPath[name]);
};
</script>

<template>
  <!-- 页面主容器 -->
  <div class="app-container">
    <!-- 页面内容区域，router-view 显示当前路由对应的页面组件 -->
    <main>
      <router-view />
    </main>

    <!--
      底部导航栏
      【Vant van-tabbar 说明】
      - v-model: 绑定当前选中项的 name
      - @change: 切换时触发的事件
      - fixed: 固定在底部
      - placeholder: 生成占位元素，防止内容被遮挡
      【v-if 说明】登录页不显示底部导航栏
    -->
    <van-tabbar v-if="showTabbar" v-model="activeTab" @change="onTabChange" fixed placeholder>
      <van-tabbar-item name="home" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item name="workspace" icon="apps-o">工作台</van-tabbar-item>
      <van-tabbar-item name="profile" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>
/* 应用容器：占满整个视口 */
.app-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
