# 钳调反馈页面开发文档

## 概述
钳调反馈页面用于查询钳调数据并进行反馈操作。

---

## 页面结构

### 头部区域
- 用户信息栏：显示"部门-班组-姓名"（从接口 `getQianTiaoUserInfo` 获取）
- 搜索表单：随页面滚动

### 搜索表单字段（4个）

| 字段 | 类型 | 必填 | 特性 |
|------|------|------|------|
| 模具 | 选择框 | ✅ | 远程搜索，输入关键词后从后端获取 |
| 件号 | 选择框 | ❌ | 可筛选，联动模具 |
| 制造令号 | 输入框 | ❌ | 普通输入 |
| 是否调班 | 单选 | - | 是/否，默认否 |

### 数据列表
- 展示字段：件号、零件名称、工艺名称、工单号
- 分页功能：每页显示 5 条数据，使用 van-pagination 组件，后端分页
- 空状态展示

### 反馈操作
- 点击数据项打开底部弹窗（van-popup）
- 弹窗高度 80%，内容可滚动
- 加载详情数据后显示表单
- 提交反馈和重置按钮

### 详情表单字段（13个）

| 字段 | 类型 | 必填 | 特性 |
|------|------|------|------|
| 模具号 | 输入框 | - | 只读，从详情数据填充 |
| 零件号 | 输入框 | - | 只读，从详情数据填充 |
| 项目号 | 输入框 | - | 只读，从详情数据填充 |
| 件号 | 输入框 | - | 只读，从列表项填充 |
| 零件名称 | 输入框 | - | 只读，从列表项填充 |
| 工艺名称 | 输入框 | - | 只读，从列表项填充 |
| 工单号 | 输入框 | - | 只读，从列表项填充 |
| 工时归属时间 | 日期时间选择器 | ✅ | 不可清空，默认当前时间，格式 YYYY-MM-DD HH:mm，限制72小时内 |
| 开始时间 | 日期时间选择器 | ✅ | 允许清空，格式 YYYY-MM-DD HH:mm，限制72小时内 |
| 结束时间 | 日期时间选择器 | ✅ | 允许清空，格式 YYYY-MM-DD HH:mm，限制72小时内 |
| 人员工时 | 输入框 | ✅ | 只读，自动计算（结束时间-开始时间），单位分钟 |
| 设备工时 | 输入框 | ✅ | 只读，与人员工时一致，仅选择加工设备后显示 |
| 加工设备 | 选择框 | ❌ | 可筛选，数据从后台获取 |
| 反馈说明 | 输入框 | ❌ | 多行文本，500字限制 |

---

## 文件结构

```
src/
├── api/
│   ├── qiandiao.js                    # 钳调相关 API 封装
│   └── common.js                      # 通用 API（getCraftList 工艺列表）
├── pages/workspace/qiandiao/
│   ├── QiandiaoFeedbackPage.vue       # 主页面
│   └── PLAN_钳调反馈.md               # 本文档
```

---

## API 接口

| 接口 | 说明 |
|------|------|
| `getQianTiaoUserInfo()` | 获取当前用户信息（deptId, deptName, plineCode, plineName, userName, nickName） |
| `getSamMouldInfoByProAndBz(params)` | 根据班组和关键词搜索模具列表（params: plineCode, moldCode） |
| `getPartNoList(mouldCode)` | 获取件号列表（依赖模具） |
| `getOrderList(params)` | 查询待处理工单列表 |
| `getQiandiaoDetail(id)` | 获取工单详情 |
| `getDeviceList()` | 获取加工设备列表 |
| `submitQiandiaoFeedback(data)` | 提交钳调反馈 |
| `getCraftList()` | 获取工艺列表（id, craftName, craftCode），用于工艺名称显示 |

### 接口地址

| 接口 | 地址 | 方法 |
|------|------|------|
| 用户信息 | `/rel/qtrel/getQianTiaoUserInfo` | GET |
| 模具搜索 | `/rel/qtrel/getSamMouldInfoByProAndBz` | GET |
| 件号列表 | `/rel/qtrel/getImportPartCodeByMouldCode/{mouldCode}` | GET |
| 工单列表 | `/SamMesPartsOrderController/partsOrder/getWaitAssignOrders` | GET |
| 工单详情 | `/SamMesPartsOrderController/partsOrder/getWaitAssignOrderById/{id}` | GET |
| 设备列表 | `/fm/equipment/getMachineListByPlineForMobile` | GET |
| 提交反馈 | `/dgn/unitBack/saveUnitBackListForQT` | POST |
| 工艺列表 | `/moldStandardCraft/moldStandardCraftController/getCraftList` | GET |

---

## 关键技术点

1. **后端分页**：使用 getOrderList 接口进行后端分页，van-pagination 组件切换页码时重新请求
2. **远程搜索**：模具选择器使用 watch 监听关键词变化，触发远程搜索
3. **联动选择**：模具→件号，使用 watch 监听
4. **详情弹窗**：使用 van-popup 底部弹窗展示详情表单，高度 80%
5. **日期时间选择器**：使用 van-picker-group 组合 van-date-picker 和 van-time-picker，步骤式选择（先选日期，点下一步选时间）
6. **时间范围限制**：只允许选择当前时间往前推72小时内的时间，通过 min-date/max-date 和 min-hour/max-hour 实现
7. **工时自动计算**：watch 监听开始/结束时间变化，自动计算分钟差
8. **设备工时联动**：watch 监听设备选择，选择设备后显示设备工时
9. **字段无映射**：直接使用后端返回的字段名，不做前端映射转换
10. **选择框显示格式**：模具、件号、设备选择框显示 `code(name)` 格式
11. **工艺名称转换**：partRoutingId 为工艺 id，通过 getCraftList 获取工艺列表后转换为 craftName 显示

---

## 字段说明

### 用户信息字段（getQianTiaoUserInfo 返回）

| 字段 | 说明 | 用途 |
|------|------|------|
| deptId | 部门ID | 提交反馈时携带 |
| deptName | 部门名称 | 页面显示 |
| plineCode | 班组编码 | 提交反馈时携带 |
| plineName | 班组名称 | 页面显示 |
| userName | 用户名 | 提交反馈时携带 |
| nickName | 姓名 | 页面显示 |

### 列表字段（直接使用后端字段）

| 显示名称 | 后端字段 |
|---------|---------|
| 件号 | importPartCode |
| 零件名称 | partName |
| 工艺名称 | partRoutingId（通过 getCraftList 转换为 craftName 显示） |
| 工单号 | orderNumber |

### 详情表单字段（直接使用后端字段）

| 显示名称 | 后端字段 | 说明 |
|---------|---------|------|
| 模具号 | moldCode | 只读，从详情数据填充 |
| 零件号 | partCode | 只读，从详情数据填充 |
| 项目号 | projectCode | 只读，从详情数据填充 |
| 件号 | importPartCode | 只读，从列表项填充 |
| 零件名称 | partName | 只读，从列表项填充 |
| 工艺名称 | partRoutingId | 只读，从列表项填充，通过 getCraftList 转换为 craftName 显示 |
| 工单号 | orderNumber | 只读，从列表项填充 |
| 工时归属 | actDateTime | 提交时格式化为字符串 |
| 开始时间 | actBeginTime | 提交时格式化为字符串 |
| 结束时间 | actEndTime | 提交时格式化为字符串 |
| 人员工时 | actManTime | 分钟，自动计算 |
| 设备工时 | actMacTime | 分钟，选择设备后显示 |
| 加工设备 | actByMac | 设备 ID |
| 反馈说明 | prdRemark | 500字限制 |

---

## 已移除功能

- 作业单位选择器及相关逻辑
- 作业班组选择器及相关逻辑
- 项目选择器及相关逻辑
- 作业人员输入框
- 远程搜索功能（模具改为本地筛选）
- 下拉刷新和上拉加载（改为分页）
- 手风琴展开效果（改为弹窗）
- 选中高亮样式（弹窗模式下不需要）
- 固定头部（sticky 定位）

---

## 待完成功能

- [x] 展开详情表单的具体字段
- [x] 对接真实后端 API
