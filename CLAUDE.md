# Language Settings

Please always respond in Simplified Chinese（简体中文） for all conversations, explanations, and documentation.

Code comments should also be in Chinese when appropriate, though technical terms and variable names can remain in English.

# 🧭开发规范

**Vue 3 + Vant 移动端项目**

> 本文档用于**严格约束在生成、修改、重构代码时的行为**。
>
> **必须 100% 遵守以下规范**，否则视为不合格输出。

---

## 0️⃣核心前提（最高优先级，不可违背）

### ❗ 项目硬性限定

1. **仅支持移动端**

* 不考虑桌面端（PC / 大屏 / Tablet）
* 不做响应式断点适配
* 不测试、不优化桌面端显示

2. **完全不考虑国际化（i18n）**

* 只支持中文
* 所有文案可直接写中文字符串
* 禁止为“未来国际化”做任何预留设计

> ⚠️ 以上两条 **覆盖本文档所有其他规则**

---

## 1️⃣核心原则（行为准则）

1. **可读性 > 技巧**

* 优先选择直观、易理解的写法
* 避免炫技式 Composition API 抽象

2. **显式优于隐式**

* 状态来源、数据流向必须清晰
* 禁止“魔法代码”“猜用途变量”

3. **面向 Vue 初学者输出**

* 默认阅读者 **完全不会 Vue 3**
* 所有 Vue 特有概念必须解释

---

## 2️⃣技术栈（不可变更）

| 分类     | 技术                          |
| ------ | --------------------------- |
| 前端框架   | Vue 3（Composition API）      |
| UI 组件库 | **Vant（移动端专用）**             |
| 状态管理   | Pinia（优先）或 provide / inject |
| 路由     | Vue Router                  |
| 样式方案   | scoped CSS / CSS Modules    |
| 构建工具   | Vite                        |
| 开发工具   | WebStorm                    |

### 🚫 明确禁止

* 国际化库（vue-i18n 等）
* 桌面端适配逻辑
* PC 组件库（Ant Design Vue、Element Plus）
* 擅自替换技术栈

---

## 3️⃣项目目录结构（强制）

```txt
src/
├── api/          # 后端 API 封装
├── components/   # 通用组件（无业务）
├── pages/        # 页面级组件（有业务）
├── router/       # 路由配置
├── stores/       # Pinia 状态
├── assets/       # 静态资源
├── styles/       # 全局样式（极少量）
```

---

## 4️⃣命名规范（强制）

* 组件名：PascalCase
* 文件名：与组件名一致
* 组合函数：useXxx
* 状态变量：语义化命名

❌ 禁止命名：data / temp / obj / a / b

---

## 5️⃣样式规范

* 默认使用 scoped CSS / CSS Modules
* 样式与组件强绑定
* 禁止大段全局 CSS

### 5.1 Vant 样式覆盖

✅ 允许：

```vue
<Button class="submit-btn" />
```

❌ 禁止：

* 修改 Vant 源码
* 全局强覆盖样式

---

## 6️⃣Vue 编码规范（重点）

### 6.1 Composition API 使用规范

* 所有 `ref` / `reactive` 必须写注释
* `watch` / `watchEffect` 必须说明：

  * 为什么存在
  * 监听对象含义
  * 触发时机

```ts
// 监听筛选条件变化，重新请求列表数据
watch(filterParams, () => {
  fetchList()
})
```

---

### 6.2 状态管理规则

* 页面内部状态 → `ref / reactive`
* 跨页面 / 用户态 → Pinia

必须说明：

* 状态存在哪
* 谁修改
* 谁消费

---

## 7️⃣Vant 使用规范（重点）

### 7.1 表单

* 使用 `van-form` + `van-field`
* 校验规则必须写清楚
* 动态表单必须说明使用原因

### 7.2 列表

* 使用 `van-list` / `van-pull-refresh`
* 大数据量必须分页或懒加载
* 每个 item 结构必须写注释

---

## 8️⃣移动端专项规范（强制）

### 8.1 设备与交互假设

* 屏幕宽度：375px ~ 430px
* 触摸操作优先
* 使用场景：手机浏览器 / 企业微信

❌ 不考虑：hover / resize / 键盘快捷键

---

### 8.2 布局规则

* 使用 Flex 布局即可
* 不使用 Grid / 响应式断点

---

## 9️⃣性能规范

* 页面级路由必须懒加载
* 防抖 / 节流必须说明原因
* 本地缓存必须说明生命周期

---

## 🔐 1️⃣0️⃣安全要求

* 所有用户输入必须校验
* 禁止在前端存储敏感信息
* Token 使用安全存储方式

---

## 🔍 1️⃣1️⃣注释与教学要求（最重要）

输出代码时必须：

1. **组件级说明**（作用 / 场景 / Props）
2. **Vue 概念解释**（ref / reactive / watch）
3. **复杂逻辑说明为什么这样做**
4. **移动端说明**（为什么使用 Popup / ActionSheet 等）

---

## 🚫 1️⃣2️⃣明确禁止行为

* 只给代码不解释
* 使用缩写 / 黑话
* 主动引入国际化
* 主动考虑桌面端
* 为未来扩展做多余设计

---

## ✅ 1️⃣3️⃣最终输出合格标准

> 在以下前提下，我依然能理解所有代码：
>
> * 只支持中文
> * 只运行在移动端
> * 用户只有VUE2的基础

---

## 🔗 1️⃣4️⃣API 配置

* **baseURL**: `http://sam.zghnsam.com/prod-api`
* API 封装统一放在 `src/api/`
