// pages/orderTallyup/orderTallyup.js
// var util = require('../../utils/util.js');
// var service = require("../../utils/service.js");
import service from "../../utils/service";
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow: true,
    remarkMsg: "",
    phoneNum: "",
    order: {},
    userInfo: {},
    goodsDetId: "",
    payWay: 2,
    payWinIsShow: false,
    walletMsg: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    // let projectCode = "020011562610607000032";
    // if (option.scene) {
    //   let qrId = decodeURIComponent(option.scene);
    //   that.setData({
    //     projectCode: projectCode
    //   })
    // }

    let itemUrl = app.globalData.basePath.item;
    let projectCode = options.projectCode;
    that.setData({
      projectCode: projectCode
    })

    service({
      url: itemUrl + "/api/WeChat/Project/GetProjectDetail",
      method: "POST",
      data: [{
        ProjectCode: projectCode
      }, 'data']
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      if (dataObj.Code == 0) {
        let res = dataObj.Data;
        let tempArr = [];
        // 支持终端数据处理
        res.TerminalSortList.map(i => {
          tempArr.push(i.SortName)
        })

        let tempStr = tempArr.join(" ");
        that.setData({
          itemMsg: res,
          terminalStr: tempStr
        })
      } else {
        console.log("获取项目单详请失败");
      }
    })
  },

  // 获取用户备注信息
  getRemarkMsg: function (e) {
    let that = this;
    let remarkMsg = that.data.remarkMsg;
    let remarkMsgTemp = e.detail.value;

    that.setData({
      remarkMsg: remarkMsgTemp
    })

  },

  // 立即购买按钮点击事件
  tallpUp: function () {
    let that = this;
    let phone = that.data.phoneNum;
    let payPath = app.globalData.basePath.pay;
    // 验证手机号为空或者不合法
    if (!phone || phone == "") {
      wx.showModal({
        title: "提示",
        content: '手机号是联系您的重要方式，请填写！',
        showCancel: false,
        confirmColor: "#ee3344",
      });
      return false;

    } else if (phone.length != 11) {
      wx.showModal({
        title: "提示",
        content: '请正确填写手机号！',
        showCancel: false,
        confirmColor: "#ee3344",
      });
      return false;

    } else {
      that.setData({
        payWinIsShow: true
      });
    }
    // 查看钱包余额
    service({
      url: payPath + "/api/v1/WeChatPay/QueryUserWallet",
      data: {
        payAmount: that.data.itemMsg.ProjectTermList[0].PhaseMoney
      }
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      if (dataObj.Code == 0) {
        that.setData({
          walletMsg: dataObj.Data
        })

      }
    })



  },
  phonechange: function (e) {
    this.setData({
      phoneNum: e.detail.value
    });
  },
  // 点击自动填写的方法，获取用户手机号
  bindGetUserPhone: function (e) {
    let phone = wx.getStorageSync('phone');
    let that = this;

    if (phone) {
      that.setData({
        phoneNum: phone
      });
      return;
    } else {}


    if (e.detail.errMsg == 'getPhoneNumber:ok') {
      let enda = e.detail.encryptedData;
      let iv = e.detail.iv;
      wx.checkSession({
        success: function (res) {
          console.log("没过期")
          let session_key = wx.getStorageSync('session_key');
          that.getPhone(session_key, enda, iv);
        },
        fail: function (res) {
          console.log("需要重新登录");
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
          phoneNum: phone
        })
        wx.setStorageSync('phone', phone);
      }
    })
  },

  // 确认支付事件
  confirmPay: function () {
    let that = this;
    that.setData({
      payWinIsShow: false
    });

    let remarkMsg = that.data.remarkMsg;
    let phone = that.data.phoneNum;
    var tradePath = app.globalData.basePath.trade;
    let userId = that.data.walletMsg.UserId;

    // 生成订单参数
    let order = {
      buyerRemark: remarkMsg,
      phone: phone,
      userId: userId,
      projectCode: that.data.projectCode,
      agentId: 0
    }


    service({
      url: tradePath + '/api/v1/Trade/SumbitOrder',
      data: [order, 'data'],
      method: "POST"
    }).then((res) => {
      wx.hideLoading({
        mask: false
      });
      let payOrderObj = JSON.parse(res.data);
      if (payOrderObj.Code == 0) {
        that.setData({
          orderItemId: payOrderObj.Data._orderitemid,
          orderNo: payOrderObj.Data._orderno
        });
        that.payMoney();

      } else {
        console.log("生成订单出错");
      }
    });


  },

  // 关闭确认支付的弹窗
  closePayConfirm: function () {
    let that = this;
    that.setData({
      payWinIsShow: false
    });
  },

  // 支付事件
  payMoney: function () {
    let that = this;

    // var payPath = app.globalData.basePath.pay;
    var tradePath = app.globalData.basePath.trade;
    let payWay = that.data.payWay;

    if (payWay == 1) {
      // payWay是1就是余额支付
      service({
        url: tradePath + '/api/v1/Trade/BalancePayOrder',
        data: [{
          orderItemId: that.data.orderItemId
        }, 'data'],
        method: 'POST'
      }).then(res => {
        wx.hideLoading();
        let dataObj = JSON.parse(res.data);
        if (dataObj.Code == 0) {
          let orderNo = that.data.orderNo;
          wx.redirectTo({
            url: '../orderDetail/orderDetail?orderNo=' + orderNo
          })

        } else {
          console.log("余额支付失败")
        }
      })
    } else {
      // 微信支付
      let openid = wx.getStorageSync('openid');

      service({
        url: tradePath + '/api/v1/Trade/PayOrder',
        data: [{
          userId: that.data.walletMsg.UserId,
          openId: openid,
          orderItemId: that.data.orderItemId
        }, 'data'],
        method: "POST"
      }).then(res => {
        wx.hideLoading();
        let dataObj = JSON.parse(res.data);
        if (dataObj.Code == 0) {
          let payModel = dataObj.Data;
          let orderNo = that.data.orderNo;
          wx.requestPayment({
            timeStamp: payModel.timeStamp,
            nonceStr: payModel.nonceStr,
            package: payModel.package,
            signType: payModel.signType,
            paySign: payModel.sign,
            success(res) {
              wx.redirectTo({
                url: '../orderDetail/orderDetail?orderNo=' + orderNo
              })
            },
            fail(res) {

              wx.redirectTo({
                url: '../orderDetail/orderDetail?orderNo=' + orderNo
              })
            }
          });
        } else {
          console.log("支付下单失败")
        }
      })
    }
  },
  // 区分余额支付还是微信支付
  radioChange: function (e) {
    let payWay = e.detail.value == "wallet" ? 1 : 2;

    this.setData({
      payWay: payWay
    })
  }
})