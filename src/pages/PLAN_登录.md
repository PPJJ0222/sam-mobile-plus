# 登录页开发计划

## 目标
开发一个美观、大气、有设计性的移动端登录页，迁移老项目的登录逻辑到 Vue 3 + Vant 4 技术栈。

## 设计方案

### UI 设计
- 顶部：蓝色渐变背景（#1989fa → #4facfe）+ 装饰圆形 + Logo + 系统名称
- 中间：白色圆角卡片表单，悬浮在渐变背景上
- 表单：账号输入框、密码输入框（带显示/隐藏切换）、记住密码复选框、登录按钮
- 动效：页面进入淡入动画、按钮点击缩放效果

### 功能
- 账号密码登录
- RSA 密码加密
- 记住密码（本地存储）
- Token 认证
- 路由守卫（未登录跳转登录页）

---

## 实现步骤

### 步骤 1：安装依赖
```bash
npm install jsencrypt
```

### 步骤 2：创建工具函数

| 文件 | 作用 |
|------|------|
| `src/utils/storage.js` | localStorage 封装（token、记住密码） |
| `src/utils/crypto.js` | RSA 加密/解密（使用用户提供的公钥私钥） |

### 步骤 3：创建 API 封装

| 文件 | 作用 |
|------|------|
| `src/api/auth.js` | 登录相关 API（loginMobile、getInfo、logout） |

### 步骤 4：创建用户 Store

| 文件 | 作用 |
|------|------|
| `src/stores/user.js` | Pinia 用户状态管理（token、userInfo、登录/登出方法） |

### 步骤 5：创建登录页面

| 文件 | 作用 |
|------|------|
| `src/pages/login/LoginPage.vue` | 登录页面组件 |

### 步骤 6：修改现有文件

| 文件 | 修改内容 |
|------|----------|
| `src/router/index.js` | 添加 /login 路由 + 路由守卫 |
| `src/api/request.js` | 完善 token 认证（请求头添加 token、401 处理） |
| `src/App.vue` | 登录页隐藏底部导航栏 |
| `src/main.js` | 注册 Checkbox 组件 |

---

## 关键文件路径

### 新建文件
- `src/pages/login/LoginPage.vue`
- `src/stores/user.js`
- `src/api/auth.js`
- `src/utils/storage.js`
- `src/utils/crypto.js`

### 修改文件
- `src/router/index.js`
- `src/api/request.js`
- `src/App.vue`
- `src/main.js`

### 参考文件
- `src/pages/home/oldLoding/login.vue` - 老项目登录逻辑
- `src/pages/home/oldLoding/user.js` - 老项目用户状态管理
- `src/assets/logo.png` - Logo 图片

---

## 配置信息

### RSA 公钥
```
MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKoR8mX0rGKLqzcWmOzbfj64K8ZIgOdH
nzkXSOVOZbFu/TJhZ7rFAN+eaGkl3C4buccQd/EjEsj9ir7ijT7h96MCAwEAAQ==
```

### RSA 私钥（用于记住密码解密）
```
MIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEAqhHyZfSsYourNxaY
7Nt+PrgrxkiA50efORdI5U5lsW79MmFnusUA355oaSXcLhu5xxB38SMSyP2KvuKN
PuH3owIDAQABAkAfoiLyL+Z4lf4Myxk6xUDgLaWGximj20CUf+5BKKnlrK+Ed8gA
kM0HqoTt2UZwA5E2MzS4EI2gjfQhz5X28uqxAiEA3wNFxfrCZlSZHb0gn2zDpWow
cSxQAgiCstxGUoOqlW8CIQDDOerGKH5OmCJ4Z21v+F25WaHYPxCFMvwxpcw99Ecv
DQIgIdhDTIqD2jfYjPTY8Jj3EDGPbH2HHuffvflECt3Ek60CIQCFRlCkHpi7hthh
YhovyloRYsM+IS9h/0BzlEAuO0ktMQIgSPT3aFAgJYwKpqRYKlLDVcflZFCKY7u3
UP8iWi1Qw0Y=
```

### 系统名称
SAM管理系统

### API baseURL
http://sam.zghnsam.com/prod-api
