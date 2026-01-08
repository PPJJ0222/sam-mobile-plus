# 质量快反表单页面实现计划

## 需求概述
创建质量快反表单页面，用于提交质量问题反馈。

## 表单字段
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| 异常单号 | 输入框 | 是 | 只读，后台生成 |
| 模具号 | 选择框 | 是 | 可筛选，数据后台返回 |
| 异常原因 | 选择框 | 是 | 可筛选，数据后台返回 |
| 责任部门 | 选择框 | 是 | 可筛选，默认登录人部门 |
| 是否技术支持 | 单选 | 是 | 是/否，默认否 |
| 问题描述 | 文本框 | 是 | 最多500字 |
| 描述图片 | 图片上传 | 否 | 批量上传/拍照，单张≤5M，超过先压缩 |
| 补救措施 | 文本框 | 否 | 最多500字 |

---

## 实现步骤

### 步骤1: 安装依赖
```bash
npm install axios
```
axios 用于 HTTP 请求。

### 步骤2: 创建 HTTP 请求封装
**文件**: `src/api/request.js`

封装 axios 实例，配置 baseURL 和拦截器。

### 步骤3: 创建质量快反 API 模块
**文件**: `src/api/quality.js`

预留接口函数：
- `generateOrderNo()` - 生成异常单号
- `getMoldList()` - 获取模具号列表
- `getReasonList()` - 获取异常原因列表
- `getDeptList()` - 获取部门列表
- `getUserInfo()` - 获取当前用户信息（含部门）
- `uploadImage()` - 上传图片
- `submitQualityForm()` - 提交表单

### 步骤4: 创建图片压缩工具
**文件**: `src/utils/imageCompress.js`

实现图片压缩功能，当图片超过5M时自动压缩。

### 步骤5: 注册 Vant 组件
**文件**: `src/main.js`

新增注册：
- Form, Field（表单）
- Picker, Popup（选择器）
- RadioGroup, Radio（单选）
- Uploader（图片上传）
- Button（按钮）
- Dialog, Toast（弹窗提示）

### 步骤6: 创建质量快反页面
**文件**: `src/pages/workspace/quality/QualityFeedbackPage.vue`

页面结构（卡片式布局）：
```
van-form
├── van-cell-group inset class="form-card"（基本信息）
│   ├── van-field（异常单号 - readonly）
│   ├── van-field + van-popup + van-picker（模具号）
│   ├── van-field + van-popup + van-picker（异常原因）
│   ├── van-field + van-popup + van-picker（责任部门）
│   └── van-radio-group（是否技术支持）
├── van-cell-group inset class="form-card"（问题详情）
│   ├── van-field type="textarea"（问题描述）
│   └── van-uploader（描述图片）
├── van-cell-group inset class="form-card"（补救措施）
│   └── van-field type="textarea"（补救措施）
└── van-button（提交）
```

**卡片式布局说明**：
- 使用 `van-cell-group` 组件配合 `inset` 属性实现圆角卡片效果
- `inset` 属性：启用圆角卡片风格，自带左右 margin 和圆角
- 通过 `.form-card` 类设置卡片间距为 12px

### 步骤7: 配置路由
**文件**: `src/router/index.js`

添加路由：
```js
{
  path: '/workspace/quality',
  name: 'QualityFeedback',
  component: () => import('../pages/workspace/quality/QualityFeedbackPage.vue'),
  meta: { title: '质量快反' }
}
```

---

## 关键实现细节

### 图片上传逻辑
1. 用户选择图片（支持多选/拍照）
2. 检查每张图片大小
3. 超过5M → 尝试压缩
4. 压缩后仍超过5M → 提示"文件过大"
5. 上传成功 → 保存返回的 URL

### 表单提交流程
1. 点击提交按钮
2. 触发 van-form 校验
3. 校验通过 → 弹出二次确认对话框
4. 确认 → 调用提交接口
5. 成功 → 提示并返回上一页

---

## 涉及文件清单
- `src/api/request.js`（新建）
- `src/api/quality.js`（新建）
- `src/utils/imageCompress.js`（新建）
- `src/main.js`（修改）
- `src/router/index.js`（修改）
- `src/pages/workspace/quality/QualityFeedbackPage.vue`（新建）
