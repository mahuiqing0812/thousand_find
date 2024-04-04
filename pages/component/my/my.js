import service from "../../../utils/service";

var app = getApp();

Component({

  /* 开启全局样式设置 */
  options: {
    addGlobalClass: true,
  },

  /* 组件的属性列表 */
  properties: {
    name: {
      type: String,
      value: 'My'
    }
  },

  /* 组件的初始数据 */

  data: {
    canIUse: wx.canIUse('button.open-type.getPhoneNumber'),
    walletNum: '',
    eysStatus: true,
    userInfo: {},
    openid: '',
    session_key: '',
    phoneNumer: '',
    showModal: '',
    amount: "",
    sinInTxt: "",
    role: 1
  },


  /* 组件生命周期函数 */
  pageLifetimes: {
    show: function () {
      // 页面被展示
      let that = this;
      let token = wx.getStorageSync('token');
      // 获取账户余额
      let payBaseUrl = app.globalData.basePath.pay;
      if (token) {
        service({
          url: payBaseUrl + "/api/v1/WechatPay/UserWallet"
        }).then(res => {
          wx.hideLoading();
          let dataObj = JSON.parse(res.data);

          if (dataObj.Code == 0) {
            let tempM = dataObj.Data;
            let allMoney = tempM._availablebalance;
            that.setData({
              walletNum: allMoney
            })
          } else {
            console.log("出现错误")
          }
        })

      }
    },
  },
  lifetimes: {
    attached: function () {
      let that = this;
      let passportUrl = app.globalData.basePath.passport;
      let phone = wx.getStorageSync('phone')
      let userInfo = wx.getStorageSync('userInfo');
      let token = wx.getStorageSync('token');


      that.setData({
        userInfo: userInfo
      })

      // 获取用户头像昵称积分等信息
      service({
        url: passportUrl + "/api/WeChat/UserInfo/GetUserWxInfo",
      }).then((res) => {
        wx.hideLoading();
        let resData = JSON.parse(res.data);
        if (resData.Code == 0) {
          let dData = resData.Data;
          let tempObj = {
            nikeName: dData.nickname,
            headimgurl: dData.headimgurl,
            credit: dData.credit
          };
          that.setData({
            userInfo: tempObj
          })
        }
      })

      // 检测签到状态、是否已经签到
      service({
        url: passportUrl + "/api/WeChat/UserInfo/UserCanSignin"
      }).then(res => {
        wx.hideLoading();
        let dataObj = JSON.parse(res.data);
        if (dataObj.Data) {
          that.setData({
            sinInTxt: "签到",
            isSign: true
          })
        } else {
          that.setData({
            sinInTxt: "已签到",
            isSign: false
          })

        }
      })
      // 如果曾经授权过手机号，直接显示
      if (phone) {
        that.setData({
          phoneNumer: phone
        })
      }

      // 根据token获取用户id
      service({
        url: passportUrl + "/api/WeChat/UserInfo/GetUserIdByToken",
        data: {
          token: token
        }
      }).then(res => {
        let dataObj = JSON.parse(res.data);
        if (dataObj.Code == 0) {
          that.setData({
            userId: dataObj.Data
          })
        }
      })



      // 获取账户余额
      let payBaseUrl = app.globalData.basePath.pay;
      if (token) {
        service({
          url: payBaseUrl + "/api/v1/WechatPay/UserWallet"
        }).then(res => {
          wx.hideLoading();
          let dataObj = JSON.parse(res.data);

          if (dataObj.Code == 0) {
            let tempM = dataObj.Data;
            let allMoney = tempM._availablebalance;
            that.setData({
              walletNum: allMoney
            })
          } else {
            console.log("出现错误")
          }
        })

      }


    },
    moved: function () {

    },
    detached: function () {

    },
  },

  /* 组件的方法列表 */
  methods: {
    // 获取手机号
    bindGetUserPhone: function (e) {
      let that = this;

      // 用户点击了允许按钮
      if (e.detail.errMsg == 'getPhoneNumber:ok') {
        let enda = e.detail.encryptedData;
        let iv = e.detail.iv;
        wx.checkSession({
          success: function (res) {
            let session_key = wx.getStorageSync('session_key');
            that.getPhone(session_key, enda, iv);
          },
          fail: function (res) {
            console.log("session过期")
            wx.login({
              success: function (res) {
                let code = res.code;
                let passportUrl = app.globalData.basePath.passport;
                service({
                  url: passportUrl + '/api/WeChat/UserInfo/GetUserOpenId',
                  data: {
                    code: code
                  }
                }).then(res => {
                  wx.hideLoading({
                    mask: false
                  });
                  let dataobj = JSON.parse(res.data);

                  if (dataobj.Code == 0) {
                    let d = JSON.parse(dataobj.Data);
                    wx.setStorageSync('session_key', d.session_key);
                    let session_key = d.session_key;
                    that.getPhone(session_key, enda, iv);
                  }
                })
              }
            })
          }
        })
      } else {
        console.log("拒绝授权手机号")
      }

    },
    inputChange: function (e) {
      let that = this;
      let amount = e.detail.value;
      that.setData({
        amount: amount
      })
    },

    // 钱包余额小眼睛状态
    toggleeye: function () {
      let eysStatus = this.data.eysStatus;
      if (eysStatus) {
        eysStatus = !eysStatus;
      } else {
        eysStatus = !eysStatus;

      }

      this.setData({
        eysStatus: eysStatus
      })

    },

    // 签到事件
    sinIn: function () {
      let that = this;
      let passportUrl = app.globalData.basePath.passport;
      if (that.data.isSign) {

        service({
          url: passportUrl + "/api/WeChat/UserInfo/UserCanSignin"
        }).then(res => {
          wx.hideLoading();
          let dataObj = JSON.parse(res.data);
          if (dataObj.Code == 0) {
            if (dataObj.Data) {

              service({
                url: passportUrl + "/api/WeChat/UserInfo/UserCredit"
              }).then((res) => {
                // 隐藏loading
                wx.hideLoading();

                that.setData({
                  sinInTxt: "已签到",
                  isSign: false
                })
                service({
                  url: passportUrl + "/api/WeChat/UserInfo/GetUserWxInfo",
                }).then((res) => {

                  let resData = JSON.parse(res.data);
                  if (resData.Code == 0) {
                    let dData = resData.Data;
                    let tempObj = {
                      nikeName: dData.nickname,
                      headimgurl: dData.headimgurl,
                      credit: dData.credit
                    };
                    that.setData({
                      userInfo: tempObj
                    })
                  }
                })

                // 显示提示框
                wx.showToast({
                  title: '积分+1',
                  icon: 'success',
                  duration: 2000
                })

              })
            } else {
              return;
            }
          }
        })
      } else {
        return;
      }

    },

    showDialogBtn: function () {
      this.setData({
        showModal: true
      })

    },
    hideModal: function () {

      this.setData({

        showModal: false

      });

    },

    // 对话框取消按钮点击事件

    onCancel: function () {

      this.hideModal();

    },

    // 对话框确认按钮点击事件

    onConfirm: function () {
      let that = this;
      let payUrl = app.globalData.basePath.pay;
      let amount = that.data.amount;

      this.hideModal();
      // 发起请求
      if (amount == '') {
        wx.showModal({
          title: "警告",
          content: "充值金额不能为空！",
          showCancel: false,
          confirmText: "重新输入",
          confirmColor: "#ee3344",
          success: function () {
            that.showDialogBtn();
          }
        })

      } else if (amount == 0) {
        wx.showModal({
          title: "警告",
          content: "充值金额不能为0！",
          showCancel: false,
          confirmText: "重新输入",
          confirmColor: "#ee3344",
          success: function () {
            that.showDialogBtn();
          }
        })
      } else {
        service({
          url: payUrl + "/api/v1/WeChatPay/SumbitRecharge",
          method: "POST",
          data: [{
            amount: amount
          }, 'data']
        }).then(res => {
          wx.hideLoading();
          let dataObj = JSON.parse(res.data);
          service({
            url: payUrl + "/api/v1/WeChatPay/UserRechargePay",
            method: "POST",
            data: [{
              orderNo: dataObj.Data
            }, 'data']
          }).then(res => {
            wx.hideLoading();
            let result = JSON.parse(res.data);
            if (result.Code == 0) {
              wx.requestPayment({
                timeStamp: result.Data.timeStamp,
                nonceStr: result.Data.nonceStr,
                package: result.Data.package,
                paySign: result.Data.sign,
                signType: 'MD5',
                success(res) {
                  let payBaseUrl = app.globalData.basePath.pay;
                  let token = wx.getStorageSync('token');
                  if (token) {
                    service({
                      url: payBaseUrl + "/api/v1/WechatPay/UserWallet"
                    }).then(res => {
                      wx.hideLoading();
                      let dataObj = JSON.parse(res.data);

                      if (dataObj.Code == 0) {
                        let tempM = dataObj.Data;
                        let allMoney = tempM._availablebalance;
                        that.setData({
                          walletNum: allMoney
                        })
                      } else {
                        console.log(dataObj.Data.Message)
                        console.log("出现错误")
                      }
                    })

                  }

                },
                fail(res) {

                }
              })
            }
          })
        })
      }
    },


    // 发起请求用户手机号
    getPhone(sessionkey, enda, iv) {
      let that = this;
      let openid = wx.getStorageSync('openid');
      service({
        url: app.globalData.basePath.passport + "/api/WeChat/UserInfo/ModifyUserPhone",
        method: "POST",
        data: [{
          openid: openid,
          sessionkey: sessionkey,
          encrypteddata: enda,
          iv: iv
        }, 'data']
      }).then((res) => {
        wx.hideLoading();
        let dataJson = JSON.parse(res.data);
        if (dataJson.Code == 0) {
          let phone = dataJson.Data.phone;
          that.setData({
            phoneNumer: phone
          })
          wx.setStorageSync('phone', phone);
        }
      })
    },

    switch_role: function (e) {
      let roles = e.currentTarget.dataset.roles;
      this.setData({
        role: roles
      });
    },
    // 跳转买家订单列表
    goGame: function (e) {
      let currentData = e.currentTarget.dataset.currentdata;
      wx.navigateTo({
        url: '../../pages/gameCase/gameCase?curData=' + currentData,
      })
    },

    // 跳转我的钱包
    check_wallet: function () {
      wx.navigateTo({
        url: '../../pages/myWallet/myWallet'
      })
    },

    // 跳转提现页面
    draw: function () {
      wx.navigateTo({
        url: '../../pages/cashWithdrawal/cashWithdrawal'
      })
    },

    // 跳转帮助中心
    skip_helpCenter: function () {
      wx.navigateTo({
        url: '../../pages/helpCenter/helpCenter'
      })
    },

    // 跳转关于我们
    skip_aboutMe: function () {
      wx.navigateTo({
        url: '../../pages/aboutMe/aboutMe'
      })

    },

    // 跳转发布项目页
    skip_publishItem: function () {
      wx.navigateTo({
        url: '../../pages/detailInfo/detailInfo'
      })
    },

    // 跳转卖家项目列表页
    check_itemlist: function (e) {
      let currentData = e.currentTarget.dataset.currentdata;

      wx.navigateTo({
        url: '../../pages/itemList/itemList?curData=' + currentData
      })
    },

    // 跳转卖家订单页
    check_orderListS: function (e) {
      let currentData = e.currentTarget.dataset.currentdata;
      wx.navigateTo({
        url: '../../pages/orderList/orderList?curData=' + currentData
      })

    },

    // 跳转用户反馈
    skip_feedBack: function () {
      wx.navigateTo({
        url: '../../pages/feedback/feedback'
      })
    },

    skip_viewItem: function () {
      wx.navigateTo({
        url: '../../pages/viewItem/viewItem'
      })
    }

  }

})