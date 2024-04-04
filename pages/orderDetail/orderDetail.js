import service from "../../utils/service";
let app = getApp();

// pages/orderTallyup/orderTallyup.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderstates: '',
    cancelReasonArr: [{
        name: "不想买了",
        checked: true
      },
      {
        name: "重复购买商品",
        checked: false
      },
      {
        name: "信息填写错误，重新下单",
        checked: false
      },
      {
        name: "其他原因",
        checked: false
      }
    ],
    cancelOrderShow: false,
    orderMsg: {},
    orderNo: "",
    goodsId: "",
    payWinIsShow: false,
    orderitemId: '',
    finishpaystate: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;

    let orderNo = options.orderNo;

    that.setData({
      orderNo: orderNo,
    })

    // 根据订单编号获取订单实体
    that.getOrderDetail();

  },

  unfoldbind: function () {

  },
  // 取消订单事件
  cancelOrder: function () {
    this.setData({
      cancelOrderShow: true
    })
  },
  // 取消订单-暂不取消按钮
  cancelOrderNo: function () {
    this.setData({
      cancelOrderShow: false
    })
  },
  // 取消订单确认按钮
  cancelOrderDefin: function () {
    let tradeUrl = app.globalData.basePath.trade;
    let that = this;
    let orderNo = that.data.orderNo;
    // 获取取消原因
    let cancelDescArr = that.data.cancelReasonArr;
    let cancelDesc = "";
    cancelDescArr.map(i => {
      if (i.checked) {
        cancelDesc = i.name
      }
    })
    // 发起取消订单请求
    service({
      url: tradeUrl + "/api/v1/Trade/CancelOrder",
      method: "POST",
      data: [{
        orderNo: orderNo,
        cancelDesc: cancelDesc
      }, 'data']
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      if (dataObj.Code == 0) {
        that.getOrderDetail();
        that.setData({
          cancelOrderShow: false
        })

      }
    })
  },

  // 确认验收事件
  verifyReceiveGood: function () {
    let that = this;
    let orderNo = that.data.orderNo;
    let tradeUrl = app.globalData.basePath.trade;

    service({
      url: tradeUrl + "/api/v1/Trade/CollectOrder",
      method: "POST",
      data: [{
        OrderNo: orderNo
      }, "data"]
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      if (dataObj.Code == 0) {
        console.log("验收成功")
        // 更新详情
        that.getOrderDetail()
      } else {
        console.log("验收失败")
      }
    })
  },


  // 待支付订单的支付事件
  awayPay: function () {
    let that = this;
    let paycertain = that.data.orderMsg.OrderItemList;

    var payPath = app.globalData.basePath.pay;
    // let payMoney = that.data.orderMsg.Order.OrderPrice;
    let payIndex = paycertain.map(i => i.PayState).indexOf(1);
    that.setData({
      payWinIsShow: true,
      payMoney: paycertain[payIndex].TermPrice,
      orderitemId: paycertain[payIndex].OrderItemId
    });

    // 查看钱包余额
    service({
      url: payPath + "/api/v1/WeChatPay/QueryUserWallet",
      data: {
        payAmount: that.data.payMoney
      }
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      if (dataObj.Code == 0) {
        that.setData({
          walletMsg: dataObj.Data
        })
      } else {
        console.log("获取钱包信息失败")
      }
    })


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
    var tradePath = app.globalData.basePath.trade;
    let payWay = that.data.payWay;
    let orderitemId = that.data.orderitemId;

    if (payWay == 1) {
      // payWay是1就是余额支付

      service({
        url: tradePath + '/api/v1/Trade/BalancePayOrder',
        data: [{
          orderItemId: orderitemId
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
          orderItemId: orderitemId
        }, 'data'],
        method: "POST"
      }).then(res => {
        wx.hideLoading();
        let dataObj = JSON.parse(res.data);
        if (dataObj.Code == 0) {
          let payModel = dataObj.Data;

          wx.requestPayment({
            timeStamp: payModel.timeStamp,
            nonceStr: payModel.nonceStr,
            package: payModel.package,
            signType: payModel.signType,
            paySign: payModel.sign,
            success(res) {
              service({
                url: tradePath + '/api/v1/Trade/FinishPayOrder',
                data: [{
                  "OrderNo": payModel.orderNo
                }, 'data'],
                method: "POST"
              }).then(res => {
                wx.hideLoading({
                  mask: false
                });
                let query = JSON.parse(res.data);

                if (query.Code == 0) {
                  wx.redirectTo({
                    url: '../orderDetail/orderDetail?orderNo=' + payModel.orderNo
                  })
                } else {
                  console.log("支付完成出错");
                }
              });
            },
            fail(res) {
              service({
                url: tradePath + "/api/v1/Trade/ExitOrderPay",
                data: [{
                  "OrderNo": payModel.orderNo
                }, 'data'],
                method: "POST"
              }).then(res => {
                wx.hideLoading();
                if (res.Code != 0) {
                  console.log("取消支付失败");
                }
              });
              let orderState = 1;
              wx.redirectTo({
                url: '../orderDetail/orderDetail?orderState=' + orderState + "&orderNo=" + payModel.orderNo
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
  },

  // 确认支付
  confirmPay: function () {
    let that = this;
    that.setData({
      payWinIsShow: false
    });
    that.payMoney();
  },
  // 根据订单编号获取订单实体
  getOrderDetail: function () {
    let that = this;
    let orderNo = that.data.orderNo;
    let tradeUrl = app.globalData.basePath.trade;
    service({
      url: tradeUrl + "/api/v1/Trade/QueryTradeByOrderNo",
      data: {
        orderNo: orderNo
      }
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      let tempArr = [];
      if (dataObj.Code == 0) {
        let payIndex = dataObj.Data.OrderItemList.map(i => i.PayState).indexOf(1);
        if (payIndex >= 0) {

          dataObj.Data.OrderItemList[payIndex].currentPay = true;
          tempArr = dataObj.Data.OrderItemList.splice(payIndex + 1);
          tempArr.map(i => {
            i.notPay = true
          })
          dataObj.Data.OrderItemList = dataObj.Data.OrderItemList.concat(tempArr);
        }
        dataObj.Data.OrderItemList.map(i => {

          i.StarTime = i.StarTime.substr(0, 10);
          i.EndTime = i.EndTime.substr(0, 10);
        })

        if (payIndex == -1) {
          that.setData({
            finishpaystate: true
          })

        } else {
          that.setData({
            finishpaystate: false
          })

        }
        that.setData({
          orderMsg: dataObj.Data
        })
        console.log(that.data.orderMsg)
      }
    })
  }

})