<!--
  我的页面

  职责：展示用户个人信息和设置入口
  使用场景：用户查看个人信息、修改设置
-->
<script setup>
// 个人中心暂无复杂逻辑，后续可添加
</script>

<template>
  <div class="profile-page">
    <section class="placeholder-section">
      <van-icon name="user-o" size="64" color="#ddd" />
      <p class="placeholder-text">个人中心开发中...</p>
    </section>
  </div>
</template>

<style scoped>
.profile-page {
  padding: 12px;
}

.placeholder-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.placeholder-text {
  margin-top: 16px;
  color: #999;
  font-size: 14px;
}
</style>
