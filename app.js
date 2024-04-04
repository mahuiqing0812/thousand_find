// import service from "./utils/service";

//app.js
App({
  code: null,
  globalData: {
    // curData: '',
    currentLocation: '',
    // terminalCurData: '',
    userInfo: null,
    isIphoneX: false,
    openid: '',
    session_key: '',
    phone: '',
    basePath: {
      "pay": "https://payapi1.1863.cn",
      "trade": "https://tradeapi1.1863.cn",
      "passport": "https://passportapi1.1863.cn",
      "item": "https://itemapi1.1863.cn",
      "extensions": "https://extensionsapi1.1863.cn",
      // "pay": "https://payapi.1863.cn",
      // "trade": "https://tradeapi.1863.cn",
      // "passport": "https://passportapi.1863.cn",
      // "item": "https://itemapi.1863.cn",
      // "extensions": "https://extensionsapi.1863.cn"
    }
  },
  onLaunch: function () {
    // 展示本地存储能力
    var that = this;
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)


    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo;

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  onShow: function () {
    let that = this;
    wx.getSystemInfo({
      success: res => {
        let modelmes = res.model;
        if (modelmes.search('iPhone X') != -1 || modelmes.search('iPhone XS') != -1) {
          that.globalData.isIphoneX = true
        }
      }
    })
  }

})