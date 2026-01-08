/**
 * 应用入口文件
 * 职责：初始化 Vue 应用，注册全局插件
 */
import { createApp } from "vue";
import App from "./App.vue";

// 引入路由
import router from "./router";

// 引入 Pinia 状态管理
import { createPinia } from "pinia";

// 引入 Vant 组件（按需引入方式）
import {
  Tabbar,
  TabbarItem,
  Icon,
  Cell,
  CellGroup,
  // 表单相关组件
  Form,
  Field,
  // 选择器组件
  Picker,
  PickerGroup,
  Popup,
  DatePicker,
  TimePicker,
  // 动作面板
  ActionSheet,
  // 单选组件
  RadioGroup,
  Radio,
  // 复选框组件（登录页记住密码使用）
  Checkbox,
  // 搜索组件（用于选择器内部筛选）
  Search,
  // 图片上传组件
  Uploader,
  // 按钮组件
  Button,
  // 弹窗组件
  Dialog,
  Toast,
  // 宫格组件（用于并排 icon 布局）
  Grid,
  GridItem,
  // 列表组件（用于上拉加载）
  List,
  // 下拉刷新组件
  PullRefresh,
  // 分页组件
  Pagination,
  // 空状态组件
  Empty,
  // 加载中组件
  Loading,
  // 选项卡组件
  Tabs,
  Tab,
} from "vant";
// 引入 Vant 样式
import "vant/lib/index.css";

// 引入全局样式
import "./styles/global.css";

// 创建 Vue 应用实例
const app = createApp(App);

// 注册插件
app.use(router); // 路由
app.use(createPinia()); // 状态管理

// 注册 Vant 组件
app.use(Tabbar);
app.use(TabbarItem);
app.use(Icon);
app.use(Cell);
app.use(CellGroup);
// 表单相关
app.use(Form);
app.use(Field);
// 选择器
app.use(Picker);
app.use(PickerGroup);
app.use(Popup);
app.use(DatePicker);
app.use(TimePicker);
// 动作面板
app.use(ActionSheet);
// 单选
app.use(RadioGroup);
app.use(Radio);
// 复选框（登录页记住密码使用）
app.use(Checkbox);
// 搜索
app.use(Search);
// 图片上传
app.use(Uploader);
// 按钮
app.use(Button);
// 弹窗
app.use(Dialog);
app.use(Toast);
// 宫格
app.use(Grid);
app.use(GridItem);
// 列表相关（钳调反馈页面使用）
app.use(List);
app.use(PullRefresh);
app.use(Pagination);
app.use(Empty);
app.use(Loading);
// 选项卡
app.use(Tabs);
app.use(Tab);

// 挂载应用
app.mount("#app");
