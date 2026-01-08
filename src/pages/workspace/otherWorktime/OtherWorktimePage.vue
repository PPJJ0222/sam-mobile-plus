<!--
  其他工时主页面

  【功能说明】
  使用 Tab 切换辅助工时和工件工时两个表单
  管理公共状态（用户信息）并传递给子组件

  【组件结构】
  - van-tabs: Tab 切换组件
    - AuxiliaryForm: 辅助工时表单
    - WorkpieceForm: 工件工时表单
-->
<template>
  <div class="other-worktime-page">
    <!-- 顶部用户信息展示 -->
    <div class="user-info-bar" v-if="userInfo">
      {{ userInfo.deptName }} _ {{ userInfo.plineName }} _ {{ userInfo.nickName }}
    </div>

    <!-- Tab 切换（卡片样式） -->
    <div class="tabs-card">
      <van-tabs v-model:active="activeTab">
        <van-tab title="辅助工时" name="auxiliary">
          <AuxiliaryForm :user-info="userInfo" />
        </van-tab>
        <van-tab title="工件工时" name="workpiece">
          <WorkpieceForm :user-info="userInfo" />
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup>
/**
 * 【Vue 3 Composition API 说明】
 * - ref: 创建响应式数据，用于基本类型
 * - onMounted: 组件挂载后执行的生命周期钩子
 */
import { ref, onMounted } from "vue";
import { getQianTiaoUserInfo } from "@/api/qiandiao";
import AuxiliaryForm from "./AuxiliaryForm.vue";
import WorkpieceForm from "./WorkpieceForm.vue";

// 当前激活的 Tab，默认显示辅助工时
const activeTab = ref("auxiliary");

// 用户信息，包含部门、班组、操作员等
// 由 API 获取后传递给子组件使用
const userInfo = ref(null);

/**
 * 获取当前用户信息
 * 页面加载时调用，获取部门、班组等信息
 */
async function fetchUserInfo() {
  try {
    userInfo.value = await getQianTiaoUserInfo();
  } catch (error) {
    console.error("获取用户信息失败:", error);
  }
}

// 组件挂载后获取用户信息
onMounted(() => {
  fetchUserInfo();
});
</script>

<style scoped>
.other-worktime-page {
  background-color: #f5f5f5;
  padding: 0 12px 12px;
}

/* 顶部用户信息栏（与钳调反馈页面保持一致） */
.user-info-bar {
  background: #1989fa;
  color: #fff;
  padding: 12px 16px;
  margin: 0 -12px 12px -12px;
  font-size: 14px;
  font-weight: 500;
}

/* Tabs 卡片样式（与钳调反馈页面的表单卡片保持一致） */
.tabs-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}
</style>
