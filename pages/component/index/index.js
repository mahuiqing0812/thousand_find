var app = getApp();
import service from '../../../utils/service.js';
Component({

  /* 开启全局样式设置 */
  options: {
    addGlobalClass: true,
  },

  /* 组件的属性列表 */
  properties: {
    name: {
      type: String,
      value: 'Index'
    }
  },

  /* 组件的初始数据 */
  data: {
    imgUrls: ["../../../images/banner.jpg", "../../../images/banner.jpg", "../../../images/banner.jpg"],
    noticeTxt: "",
    currentTab: 0,
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isLogin: true,
    userInfo: null,
    openid: ''
  },

  /* 组件生命周期函数 */
  lifetimes: {

    attached: function () {
      let extensionsUrl = app.globalData.basePath.extensions;
      let that = this;
      var token = wx.getStorageSync('token');
      if (!token || token == '') {
        wx.hideLoading();
        that.setData({
          isLogin: false
        })

      } else {
        // 发起请求检测该用户是否可以访问系统
        that.setData({
          isLogin: true
        })
        // that.bindgetuserinfo();

      }





      // 获取公告内容
      service({
        url: extensionsUrl + "/api/WeChat/WxNotice/GetFirstNotice",

      }).then(res => {
        //请求处理完成隐藏loading
        wx.hideLoading();
        if (res.data && res.data != "") {
          let dataJson = JSON.parse(res.data);
          if (dataJson && dataJson.Code == 0) {
            if (dataJson.Data) {
              //检测title长度，剩余...补齐
              that.setData({
                noticeTxt: dataJson.Data.Title
              })
            }
          }
        }


      })
    },

    moved: function () {


    },
    detached: function () {

    },
  },
  /* 组件的方法列表 */
  methods: {

    bindgetuserinfo: function (e) {
      let that = this;
      if (e.detail.userInfo) {
        wx.login({
          success: function (res) {
            let code = res.code;
            if (res.code) {
              wx.showLoading({
                title: '努力加载中。。。',
                mask: true
              });
            }
            let passportUrl = app.globalData.basePath.passport;
            service({
              url: passportUrl + '/api/WeChat/UserInfo/GetUserOpenId',
              data: {
                code: code
              }
            }).then((res) => {
              wx.hideLoading({
                mask: false
              });
              that.setData({
                isLogin: true
              });
              let dataJson = JSON.parse(res.data);
              if (dataJson.Code == 0) {
                let d = JSON.parse(dataJson.Data);
                that.setData({
                  openid: d.openid,
                });
                //存储方式应修改为缓存
                wx.setStorageSync('openid', d.openid);
                wx.setStorageSync('session_key', d.session_key);
                // app.globalData.openid = d.openid;
                // app.globalData.session_key = d.session_key;

                wx.getUserInfo({
                  success: function (res) {
                    var obj = {
                      openid: d.openid,
                      nickname: res.userInfo.nickName,
                      sex: res.userInfo.gender,
                      headimgurl: res.userInfo.avatarUrl,
                      province: res.userInfo.province,
                      city: res.userInfo.city,
                      country: res.userInfo.country
                    };

                    app.globalData.userInfo = obj;
                    service({
                      url: passportUrl + '/api/WeChat/UserInfo/register',
                      data: [obj, 'data'],
                      method: "POST"
                    }).then((res) => {
                      wx.hideLoading();
                      let dataObj = JSON.parse(res.data);
                      if (dataObj.Code == 0) {

                        let dData = dataObj.Data;
                        wx.setStorageSync('token', dData.token);

                        let userInfo = {
                          "nickname": dData.nickname,
                          "sex": dData.sex,
                          "headimgurl": dData.headimgurl
                        }
                        wx.setStorageSync('userInfo', userInfo);
                        app.globalData.userInfo = userInfo
                      } else {
                        console.log("注册失败")
                      }

                    })
                  }
                })
              } else {
                wx.showModal({
                  title: "提示",
                  content: '登录失败，请检查网络后重试！',
                  showCancel: false
                });
              }

            })
          }
        })
      } else {
        wx.showModal({
          title: '警告',
          content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
          showCancel: false,
          confirmText: '返回授权',
          confirmColor: "#ee3344",
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击了：“返回授权”')
            }
          }
        })
      }
    },
    skip_niticeDetail: function () {
      wx.navigateTo({
        url: '../noticeDetail/noticeDetail'
      })
    },
    skip_qualityItem_ing: function () {
      let state = 1;
      wx.navigateTo({
        url: '../qualityItem/qualityItem?state=' + state
      })
    },
    skip_qualityItem_fini: function () {
      let state = 2;
      wx.navigateTo({
        url: '../qualityItem/qualityItem?state=' + state
      })
    },
    skip_qualityItem: function () {
      wx.navigateTo({
        url: '../qualityItem/qualityItem'
      })

    },
    skip_itList: function (e) {
      let currData = e.currentTarget.dataset.currdata;
      app.globalData.curData = currData;
      wx.navigateTo({
        url: '../itList/itList?currData=' + currData
      })

    },
    skip_itList_ter: function (e) {
      let terminalCurData = e.currentTarget.dataset.terminalcurid;
      app.globalData.terminalCurData = terminalCurData;

      wx.navigateTo({
        url: '../itList/itList?terminalData=' + terminalCurData
      })
    },

    onShareAppMessage: function () {

    }
  }

})