<template>
  <view class="normal-login-container">
    <!--图标logo-->
    <view class="logo-content">
      <image class="logo-image" :src="globalConfig.appInfo.logo" mode="widthFix"/>
      <!--<view class="logo-text">SAM管理系统</view>-->
    </view>
    <!--图标logo-->

    <view class="login-form-content">
      <!--<view class="input-item flex align-center">
        <view class="iconfont icon-user icon"></view>
        <input v-model="loginForm.username" class="input" type="text" placeholder="请输入账号" maxlength="30"/>
      </view>
      <view class="input-item flex align-center">
        <view class="iconfont icon-password icon" @click="changePassword"></view>
        <input class="input" v-model="loginForm.password" :password="showPassword"/>
      </view>
      <view class="action-btn">
        <button @click="handleLogin" class="login-btn cu-btn block bg-blue lg round">登录</button>
      </view>-->
      <el-form ref="loginForm" :model="loginForm" class="login-form">
        <!--<h3 class="title">SAM后台管理系统</h3>-->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" type="text" auto-complete="off" placeholder="账号">
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
              v-model="loginForm.password"
              type="password"
              auto-complete="off"
              placeholder="密码"
              @keyup.enter.native="handleLogin"
          >
          </el-input>
        </el-form-item>
        <el-checkbox v-model="loginForm.rememberMe" style="margin:0 0 25px 0;">记住密码</el-checkbox>
        <el-form-item style="width:100%;">
          <el-button
              size="medium"
              type="primary"
              style="width:100%;"
              @click.native.prevent="handleLogin"
          >登 录
          </el-button>
        </el-form-item>
      </el-form>
    </view>

  </view>
</template>

<script>
import {decrypt, encrypt} from "../utils/jsencrypt";

export default {
  data() {
    return {
      codeUrl: "",
      captchaEnabled: true,
      // 用户注册开关
      register: false,
      globalConfig: getApp().globalData.config,
      loginForm: {
        username: "",
        password: "",
        code: "",
        uuid: '',
        rememberMe: true,
      },
      showPassword: true
    }
  },
  created() {
    const username = uni.getStorageSync('username')
    const password = uni.getStorageSync('password')
    const rememberMe = uni.getStorageSync('rememberMe')
    this.loginForm = {
      username: username === undefined ? this.loginForm.username : username,
      password: password === undefined ? this.loginForm.password : decrypt(password),
      rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
    }
  },
  methods: {
    changePassword: function () {
      this.showPassword = !this.showPassword;
    },
    // 登录方法
    async handleLogin() {
      console.log('enter function', 'handleLogin')
      if (!this.loginForm.username) {
        return this.$modal.msgError("请输入您的账号")
      }
      if (!this.loginForm.password) {
        return this.$modal.msgError("请输入您的密码")
      }
      this.$modal.loading("登录中，请耐心等待...")
      await this.pwdLogin()

    },
    // 密码登录
    async pwdLogin() {
      console.log('enter function', 'pwdLogin')
      let formData = this.loginForm
      formData.password = encrypt(formData.password)
      let that = this
      this.$store.dispatch('LoginMobile', formData).then(() => {
        if (that.loginForm.rememberMe) {
          uni.setStorageSync('username', that.loginForm.username);
          uni.setStorageSync('password', that.loginForm.password);
          uni.setStorageSync('rememberMe', that.loginForm.rememberMe);
        } else {
          uni.removeStorageSync('username');
          uni.removeStorageSync('password');
          uni.removeStorageSync('rememberMe');
        }
        that.$modal.closeLoading()
        that.loginSuccess()
      })
    },
    // 登录成功后，处理函数
    loginSuccess(result) {
      // 设置用户信息
      this.$store.dispatch('GetInfo').then(res => {
        this.$tab.reLaunch('/pages/index')
      })
    }
  }
}
</script>

<style lang="scss">
.logo-content {
  display: flex;
  flex-direction: column; /* 设置为垂直排列 */
  align-items: center;
  justify-content: center;
}

.logo-image {
  width: 250rpx;
  height: 100rpx;
}

.logo-text {
  margin-top: 10rpx; /* 可根据需要调整间距 */
  font-size: 40rpx;
  color: #333;
}

page {
  background-color: #ffffff;
}

.normal-login-container {
  width: 100%;

  .logo-content {
    width: 100%;
    font-size: 21px;
    text-align: center;
    padding-top: 15%;

    image {
      border-radius: 4px;
    }

    .title {
      margin-left: 10px;
    }
  }

  .login-form-content {
    text-align: center;
    margin: 15% auto 20px;
    width: 80%;

    .input-item {
      margin: 20px auto;
      background-color: #f5f6f7;
      height: 45px;
      border-radius: 20px;

      .icon {
        font-size: 38rpx;
        margin-left: 10px;
        color: #999;
      }

      .input {
        width: 100%;
        font-size: 14px;
        line-height: 20px;
        text-align: left;
        padding-left: 15px;
      }

    }

    .login-btn {
      margin-top: 40px;
      height: 45px;
    }

    .reg {
      margin-top: 15px;
    }

    .xieyi {
      color: #333;
      margin-top: 20px;
    }

    .login-code {
      height: 38px;
      float: right;

      .login-code-img {
        height: 38px;
        position: absolute;
        margin-left: 10px;
        width: 200rpx;
      }
    }
  }
}

</style>
