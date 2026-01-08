<!--
  首页组件

  职责：展示数据统计、常用功能入口和消息列表
  使用场景：用户打开应用默认看到的页面

  【布局结构】
  1. 数据统计卡片区 - 展示关键指标
  2. 常用功能 - 快捷入口
  3. 消息列表 - 最新消息/通知
-->
<script setup>
import { ref } from "vue";

/**
 * 统计卡片数据
 * 【ref 解释】ref() 创建一个响应式变量，值变化时视图自动更新
 */
const statsCards = ref([
  {
    id: 1,
    title: "待办事项",
    value: 12,
    icon: "todo-list-o",
    color: "#1989fa",
  },
  { id: 2, title: "已完成", value: 36, icon: "success", color: "#07c160" },
  { id: 3, title: "进行中", value: 8, icon: "clock-o", color: "#ff976a" },
]);

/**
 * 常用功能入口
 * 【ref 解释】ref() 持有数组数据，便于在模板里循环渲染出多个功能按钮
 */
const quickActions = ref([
  {
    id: 1,
    name: "考勤打卡",
    desc: "上班下班快速打卡",
    icon: "underway-o",
    color: "#1989fa",
  },
  {
    id: 2,
    name: "请假申请",
    desc: "填写并提交请假单",
    icon: "notes-o",
    color: "#ff976a",
  },
  {
    id: 3,
    name: "审批中心",
    desc: "查看与处理流程",
    icon: "orders-o",
    color: "#07c160",
  },
  {
    id: 4,
    name: "公告栏",
    desc: "浏览最新公告",
    icon: "volume-o",
    color: "#ee0a24",
  },
  {
    id: 5,
    name: "费用报销",
    desc: "上传票据提交审核",
    icon: "balance-o",
    color: "#7232dd",
  },
  {
    id: 6,
    name: "通讯录",
    desc: "快速找到同事联系方式",
    icon: "friends-o",
    color: "#ffa300",
  },
  {
    id: 7,
    name: "日程安排",
    desc: "当天任务一目了然",
    icon: "calendar-o",
    color: "#00b578",
  },
  {
    id: 8,
    name: "工单中心",
    desc: "处理工单与问题",
    icon: "manager-o",
    color: "#3f45ff",
  },
]);

/**
 * 消息列表数据
 */
const messageList = ref([
  {
    id: 1,
    title: "系统通知",
    content: "您有一条新的审批待处理",
    time: "10:30",
  },
  { id: 2, title: "工作提醒", content: "今日会议将于14:00开始", time: "09:15" },
  { id: 3, title: "任务更新", content: "项目A已更新至最新版本", time: "昨天" },
]);
</script>

<template>
  <div class="home-page">
    <!-- 数据统计卡片区 -->
    <section class="stats-section">
      <div class="stats-grid">
        <!--
          【v-for 解释】
          循环渲染列表，:key 是唯一标识，帮助 Vue 高效更新 DOM
        -->
        <div v-for="card in statsCards" :key="card.id" class="stats-card">
          <!-- Vant Icon 组件，显示图标 -->
          <van-icon :name="card.icon" :color="card.color" size="28" />
          <div class="stats-value">{{ card.value }}</div>
          <div class="stats-title">{{ card.title }}</div>
        </div>
      </div>
    </section>

    <!-- 常用功能入口 -->
    <section class="feature-section">
      <div class="section-header">
        <span class="section-title">常用功能</span>
        <span class="section-more">全部功能</span>
      </div>
      <!--
        【功能入口布局说明】
        采用 Vant Icon 组件配合 flex 布局，手机端四列均分，方便拇指点击
      -->
      <div class="feature-grid">
        <div
          v-for="action in quickActions"
          :key="action.id"
          class="feature-card"
        >
          <van-icon :name="action.icon" :color="action.color" size="26" />
          <div class="feature-name">{{ action.name }}</div>
          <div class="feature-desc">{{ action.desc }}</div>
        </div>
      </div>
    </section>

    <!-- 消息列表 -->
    <section class="message-section">
      <div class="section-header">
        <span class="section-title">最新消息</span>
        <span class="section-more">查看全部</span>
      </div>
      <!--
        【Vant Cell 组件说明】
        van-cell-group: 单元格分组容器
        van-cell: 单元格，常用于列表展示
        - title: 左侧标题
        - value: 右侧内容
        - label: 标题下方的描述
      -->
      <van-cell-group inset>
        <van-cell
          v-for="msg in messageList"
          :key="msg.id"
          :title="msg.title"
          :value="msg.time"
          :label="msg.content"
          is-link
        />
      </van-cell-group>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  padding: 12px;
  padding-bottom: 20px;
}

/* 统计卡片区 */
.stats-section {
  margin-bottom: 12px;
}

.stats-grid {
  display: flex;
  gap: 12px;
}

.stats-card {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 16px 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stats-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 8px 0 4px;
}

.stats-title {
  font-size: 12px;
  color: #999;
}

/* 常用功能区域 */
.feature-section {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.section-more {
  font-size: 12px;
  color: #1989fa;
}

.feature-grid {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
}

.feature-card {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  box-sizing: border-box;
}

.feature-name {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.feature-desc {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
  text-align: center;
  padding: 0 6px;
}

/* 消息列表 */
.message-section {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* 覆盖 Vant Cell 的内边距 */
.message-section :deep(.van-cell-group--inset) {
  margin: 0;
}
</style>
