<!--
  工作台页面

  职责：展示工作相关功能入口（单据审批、工时反馈、冲焊检具、质量快反）
  使用场景：用户处理工作任务的主要页面

  【布局说明】
  采用 4x1 垂直列表布局，使用 Vant 的 van-cell-group + van-cell 组件
  每个菜单项包含：左侧图标 + 标题 + 描述 + 右侧箭头
-->
<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { showToast } from "vant";

/**
 * 【ref 解释】ref() 是 Vue 3 的响应式 API
 * 当 ref 包裹的数据变化时，页面会自动更新
 *
 * 菜单数据结构说明：
 * - id: 唯一标识
 * - name: 菜单名称
 * - desc: 功能描述
 * - icon: Vant 图标名称
 * - color: 图标颜色
 * - path: 点击后跳转的路由路径（预留，子页面后续开发）
 */
const menuItems = ref([
  {
    id: 1,
    name: "单据审批",
    desc: "审批各类单据",
    icon: "orders-o",
    color: "#1989fa",
    path: "/workspace/approval",
  },
  {
    id: 2,
    name: "工时反馈",
    desc: "填报工时信息",
    icon: "clock-o",
    color: "#07c160",
    path: "/workspace/workhour",
  },
  {
    id: 3,
    name: "冲焊检具",
    desc: "检具管理操作",
    icon: "setting-o",
    color: "#ff976a",
    path: "/workspace/fixture",
  },
  {
    id: 4,
    name: "质量快反",
    desc: "质量问题反馈",
    icon: "warning-o",
    color: "#ee0a24",
    path: "/workspace/quality",
  },
]);

/**
 * 【工时反馈子菜单】
 * 控制 ActionSheet 弹出状态
 */
const showWorkhourSheet = ref(false);

/**
 * 工时反馈子菜单选项
 * name: 显示的文字
 * id: 唯一标识，用于后续跳转判断
 * icon: Vant 图标名称
 * color: 图标颜色
 */
const workhourActions = [
  { name: "钳调反馈", id: "qiandiao", icon: "edit", color: "#1989fa" },
  { name: "其他工时", id: "other", icon: "clock-o", color: "#07c160" },
  { name: "复核工时", id: "review", icon: "todo-list-o", color: "#ff976a" },
];

/**
 * 【useRouter 解释】Vue Router 提供的组合式函数
 * 用于获取路由实例，通过 router.push() 可以进行页面跳转
 */
const router = useRouter();

// 点击菜单项，跳转到对应页面（工时反馈特殊处理：弹出子菜单）
const handleMenuClick = (item) => {
  // 工时反馈菜单：弹出子菜单而不是跳转
  if (item.id === 2) {
    showWorkhourSheet.value = true;
    return;
  }
  router.push(item.path);
};

/**
 * 工时反馈子菜单选择处理
 * 先关闭弹窗，再跳转到对应页面
 */
const onWorkhourSelect = (action) => {
  showWorkhourSheet.value = false;

  // 根据选择跳转到对应页面
  const actionToPath = {
    qiandiao: "/workspace/qiandiao",
    other: "/workspace/other-worktime",
    // TODO: 后续添加复核工时页面
    // review: "/workspace/workhour/review",
  };

  if (actionToPath[action.id]) {
    router.push(actionToPath[action.id]);
  } else {
    showToast(`${action.name}页面开发中`);
  }
};
</script>

<template>
  <div class="workspace-page">
    <!--
      【布局说明】卡片式布局
      每个菜单项都是一个独立的卡片，使用 menu-list 容器控制间距
    -->
    <div class="menu-list">
      <!--
        【v-for 解释】Vue 的列表渲染指令
        遍历 menuItems 数组，为每个菜单项生成一个独立的卡片
        :key 是唯一标识，帮助 Vue 高效更新 DOM
      -->
      <van-cell-group
        v-for="item in menuItems"
        :key="item.id"
        inset
        class="form-card"
      >
        <van-cell
          :title="item.name"
          :label="item.desc"
          is-link
          @click="handleMenuClick(item)"
        >
          <!--
            【#icon 解释】Vue 的具名插槽语法
            van-cell 组件提供 icon 插槽，用于自定义左侧图标
            这里使用 van-icon 组件，可以设置图标颜色
          -->
          <template #icon>
            <van-icon
              :name="item.icon"
              :color="item.color"
              size="24"
              class="menu-icon"
            />
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!--
      【van-popup + van-grid 解释】
      van-popup: Vant 的弹出层组件，从底部弹出显示内容
      van-grid: Vant 的宫格组件，用于展示并排的图标按钮
      - position="bottom" 从底部弹出
      - round 圆角样式
      - :column-num="3" 设置为3列布局
      - :border="false" 不显示边框
    -->
    <van-popup v-model:show="showWorkhourSheet" position="bottom" round>
      <div class="popup-header">选择工时类型</div>
      <van-grid :column-num="3" :border="false" class="workhour-grid">
        <van-grid-item
          v-for="action in workhourActions"
          :key="action.id"
          :icon="action.icon"
          :icon-color="action.color"
          :text="action.name"
          @click="onWorkhourSelect(action)"
        />
      </van-grid>
      <div class="popup-cancel" @click="showWorkhourSheet = false">取消</div>
    </van-popup>
  </div>
</template>

<style scoped>
.workspace-page {
  padding: 12px;
  background: #f5f5f5;
}

/* 菜单列表容器，控制卡片间距 */
.menu-list {
  display: flex;
  flex-direction: column;
}

/* 菜单图标右侧间距 */
.menu-icon {
  margin-right: 12px;
}

/* 表单卡片，卡片之间保持 12px 间距 */
.form-card {
  margin: 0;
  margin-bottom: 12px;
}

/* 弹窗标题样式 */
.popup-header {
  padding: 16px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
}

/* 工时类型宫格底部间距 */
.workhour-grid {
  padding-bottom: 16px;
}

/* 取消按钮样式 */
.popup-cancel {
  padding: 14px;
  text-align: center;
  font-size: 16px;
  color: #121315ff;
  border-top: 8px solid #f7f8fa;
}
</style>
