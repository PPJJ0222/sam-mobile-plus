# 其他工时功能开发计划

> 状态：已完成 ✅

## 一、功能概述

实现"其他工时"模块，包含两个表单：
- **辅助工时表单**：用于记录辅助性工作的工时
- **工件工时表单**：用于记录具体工件加工的工时

---

## 二、目录结构

```
src/pages/workspace/
├── WorkspacePage.vue              # 已有，需添加路由跳转
├── otherWorktime/                 # 新建目录
│   ├── OtherWorktimePage.vue      # 主页面（Tab 切换）
│   ├── AuxiliaryForm.vue          # 辅助工时表单组件
│   ├── WorkpieceForm.vue          # 工件工时表单组件
│   └── utils.ts                   # 工时计算等工具函数
```

```
src/api/
├── otherWorktime.ts               # 其他工时相关 API
```

---

## 三、实现步骤

### 步骤 1：创建 API 封装文件

**文件**: `src/api/otherWorktime.ts`

封装以下接口：
- `getCraftByBigType(bigTypeName)` - 获取工艺列表（辅助工时用）
- `getCraftByPlineId(plineCode)` - 获取工艺列表（工件工时用）
- `getMachineListByPline(params)` - 获取设备列表
- `selectAllMouldCodeByProjectCode(projectCode)` - 获取模具列表
- `getImportPartCodeByMouldCode(mouldCode)` - 获取件号列表
- `saveMesOtherBackList(data)` - 提交辅助工时
- `workPieceTimeFeedback(data)` - 提交工件工时
- `getDicts(dictType)` - 获取字典数据（工时类型）

---

### 步骤 2：创建工具函数文件

**文件**: `src/pages/workspace/otherWorktime/utils.ts`

实现：
- `calculateActManTime(beginDate, endDate)` - 计算人员工时（扣除休息时间）
- `formatDateTime(date)` - 日期时间格式化

**工时计算规则**：
- 午休：12:00 - 13:30（90分钟）
- 晚休：17:30 - 18:00（30分钟）
- 晚班休息：23:30 - 次日00:30（60分钟）

---

### 步骤 3：创建主页面

**文件**: `src/pages/workspace/otherWorktime/OtherWorktimePage.vue`

功能：
- 使用 `van-tabs` 实现辅助工时/工件工时切换
- 引入两个表单子组件
- 管理公共状态（部门、班组、用户信息）

**页面布局**：
- 顶部用户信息栏（与钳调反馈页面保持一致）
- Tabs 外层使用卡片样式包裹

**样式规范**：

```css
/* 页面容器 */
.other-worktime-page {
  background-color: #f5f5f5;
  padding: 0 12px 12px;
}

/* 顶部用户信息栏（蓝色背景、白色文字） */
.user-info-bar {
  background: #1989fa;
  color: #fff;
  padding: 12px 16px;
  margin: 0 -12px 12px -12px;  /* 负边距保持全宽 */
  font-size: 14px;
  font-weight: 500;
}

/* Tabs 卡片样式 */
.tabs-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}
```

**用户信息显示格式**：`部门 _ 班组 _ 姓名`

---

### 步骤 4：创建辅助工时表单

**文件**: `src/pages/workspace/otherWorktime/AuxiliaryForm.vue`

**表单字段**：
| 字段 | 组件 | 必填 | 说明 |
|------|------|------|------|
| 工时归属 | van-field + van-datetime-picker | 是 | 默认当前时间 |
| 开始时间 | van-field + van-datetime-picker | 是 | - |
| 结束时间 | van-field + van-datetime-picker | 是 | - |
| 人员工时 | van-field | 是 | 只读，自动计算 |
| 设备工时 | van-field | 否 | 只读，选设备后填入 |
| 工艺 | van-field + van-picker | 否 | 可筛选 |
| 加工设备 | van-field + van-picker | 否 | 可筛选 |
| 反馈说明 | van-field textarea | 否 | 最大500字 |

**核心逻辑**：
- 开始/结束时间变化时，自动计算人员工时
- 选择加工设备后，设备工时 = 人员工时
- 清空设备时，设备工时清空

---

### 步骤 5：创建工件工时表单

**文件**: `src/pages/workspace/otherWorktime/WorkpieceForm.vue`

**表单字段**：
| 字段 | 组件 | 必填 | 说明 |
|------|------|------|------|
| 模具号 | van-field + van-picker | 是 | 远程搜索 |
| 件号 | van-field + van-picker | 是 | 依赖模具号 |
| 工单号 | van-field | 是 | 只读，自动生成 |
| 工时归属 | van-field + van-datetime-picker | 是 | 默认当前时间 |
| 开始时间 | van-field + van-datetime-picker | 是 | - |
| 结束时间 | van-field + van-datetime-picker | 是 | - |
| 工时类型 | van-field + van-picker | 是 | 字典数据 |
| 人员工时 | van-field | 是 | 只读，自动计算 |
| 设备工时 | van-field | 否 | 只读，选设备后填入 |
| 工艺 | van-field + van-picker | 否 | 可筛选 |
| 加工设备 | van-field + van-picker | 否 | 可筛选 |
| 反馈说明 | van-field textarea | 否 | 最大500字 |

**核心逻辑**：
- 模具号变化时，清空件号和工单号，请求件号列表
- 件号变化时，自动生成工单号（格式：`模具号_Q01_件号`）
- 工时计算逻辑同辅助工时

---

### 步骤 6：配置路由

**文件**: `src/router/index.ts`

添加路由：
```ts
{
  path: '/workspace/other-worktime',
  name: 'OtherWorktime',
  component: () => import('@/pages/workspace/otherWorktime/OtherWorktimePage.vue'),
  meta: { title: '其他工时' }
}
```

---

### 步骤 7：更新工作台页面

**文件**: `src/pages/workspace/WorkspacePage.vue`

修改"其他工时"菜单项的点击事件，跳转到 `/workspace/other-worktime`

---

## 四、API 接口清单

| 接口 | 方法 | 路径 | 用途 |
|------|------|------|------|
| 获取工艺（大分类） | GET | `/moldStandardCraft/moldStandardCraftController/getCraftByBigType/{bigTypeName}` | 辅助工时 |
| 获取工艺（班组） | GET | `/samMesPlineCraft/samMesPlineCraftController/getCraftByPlineId/{plineCode}` | 工件工时 |
| 获取设备列表 | GET | `/fm/equipment/getMachineListByPlineForMobile` | 两个表单 |
| 获取模具列表 | GET | `/mould/info/selectAllMouldCodeByProjectCode/{projectCode}` | 工件工时 |
| 获取件号列表 | GET | `/rel/qtrel/getImportPartCodeByMouldCode/{mouldCode}` | 工件工时 |
| 提交辅助工时 | POST | `/dgn/unitBack/saveMesOtherBackList` | 辅助工时 |
| 提交工件工时 | POST | `/dgn/unitBack/workPieceTimeFeedback` | 工件工时 |
| 获取字典 | GET | `/system/dict/data/type/{dictType}` | 工时类型 |

---

## 五、验证方案

1. **辅助工时表单测试**：
   - 选择开始/结束时间，验证人员工时自动计算
   - 选择加工设备，验证设备工时自动填入
   - 提交表单，验证数据正确发送到后台
   - 点击重置，验证表单清空

2. **工件工时表单测试**：
   - 搜索并选择模具号，验证件号列表更新
   - 选择件号，验证工单号自动生成
   - 验证工时计算和设备联动
   - 提交表单，验证数据正确发送

3. **页面切换测试**：
   - Tab 切换时表单状态保持
   - 从工作台跳转正常

---

## 六、关键文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/pages/workspace/otherWorktime/PLAN.md` | 新建 | 本开发计划文档 |
| `src/api/otherWorktime.ts` | 新建 | API 封装 |
| `src/pages/workspace/otherWorktime/utils.ts` | 新建 | 工具函数 |
| `src/pages/workspace/otherWorktime/OtherWorktimePage.vue` | 新建 | 主页面 |
| `src/pages/workspace/otherWorktime/AuxiliaryForm.vue` | 新建 | 辅助工时表单 |
| `src/pages/workspace/otherWorktime/WorkpieceForm.vue` | 新建 | 工件工时表单 |
| `src/router/index.ts` | 修改 | 添加路由 |
| `src/pages/workspace/WorkspacePage.vue` | 修改 | 更新跳转 |

---

## 七、实施顺序

1. 创建 `src/pages/workspace/otherWorktime/` 目录
2. 将本计划文档保存为 `PLAN.md` 到该目录
3. 按步骤 1-7 依次实现各文件
4. 完成后进行验证测试
