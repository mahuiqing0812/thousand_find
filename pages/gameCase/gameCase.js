import service from "../../utils/service";

// pages/case/case.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentData: 0,
    scrollHeight: 0, //滚动区域高度
    payMoney: '',
    orderListArr: [],
    payWinIsShow: false,
    btnsShow: true,
    orderType: 1,
    cancelOrderShow: false,
    cancelReasonArr: [{
        name: "不想要了",
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
    pageNo: 1,
    pageSize: 10
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // var query = wx.createSelectorQuery();
    var that = this;
    // let tradeUrl = app.globalData.basePath.trade;

    // let orderListArr = that.data.orderListArr;
    // 查看订单按钮进来传的参数
    let appGC = options.curData;
    that.setData({
      currentData: appGC
    })

    // 加载数据
    that.getMore(that.data.pageNo);

    // 获取手机高度
    wx.getSystemInfo({
      success: function (res) {
        let windowH = res.windowHeight;
        that.setData({
          windowH: windowH
        })
      }
    })



  },
  bindchange: function (e) {
    const that = this;
    that.setData({
      currentData: e.detail.current
    })

  },

  //点击切换，滑块index赋值
  checkCurrent: function (e) {
    const that = this;
    let current = e.target.dataset.current;
    let pageNo = 1;

    // 判断点击元素是否是当前元素
    if (that.data.currentData === current) {
      return false;
    } else {
      that.setData({
        currentData: current
      })
    }
    that.getMore(pageNo);
  },

  // 点击订单跳转订单详情页面
  goOrderDetail: function (e) {
    let orderNo = e.currentTarget.dataset.orderno;
    let orderitemId = e.currentTarget.dataset.orderitemid;
    wx.navigateTo({
      url: '../orderDetail/orderDetail?orderNo=' + orderNo + '&orderitemId=' + orderitemId,
    })
  },

  // 取消订单事件
  cancelOrder: function (e) {
    let orderNo = e.currentTarget.dataset.orderno;
    this.setData({
      cancelOrderShow: true,
      orderNo: orderNo
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
    // 调取取消订单接口
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
      (dataObj)
      if (dataObj.Code == 0) {
        that.setData({
          cancelOrderShow: false
        })
        wx.showToast({
          title: "取消订单成功"
        })

        // 重新拉取数据
        that.getMore(1);
      }

    })
  },
  // "去支付"按钮点击事件
  goPay: function (e) {
    let that = this;
    let tradeUrl = app.globalData.basePath.trade;
    let payPath = app.globalData.basePath.pay;
    let orderNo = e.currentTarget.dataset.orderno;
    let orderitemid = e.currentTarget.dataset.orderitemid;
    let payMoney = e.currentTarget.dataset.paymoney;
    that.setData({
      payWinIsShow: true,
      payMoney: payMoney,
      orderNo: orderNo,
      orderitemid: orderitemid
    });

    // 查看钱包余额
    service({
      url: payPath + "/api/v1/WeChatPay/QueryUserWallet",
      data: {
        payAmount: payMoney
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
  // 联系客服按钮的阻止冒泡事件
  conCustom() {

  },


  // 确认收货
  verifyReceiveGood: function (e) {
    let that = this;
    let orderNo = e.currentTarget.dataset.orderno;
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
        console.log("确认验收成功");
        // 刷新列表
        that.getMore(1);
      } else {
        console.log("确认验收失败");
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  reactBottom: function () {
    this.data.pageNo += 1;
    wx.showLoading({
      title: '加载更多',
      mask: true
    })
    var that = this;
    this.getMore(that.data.pageNo);
  },

  // 获取更多
  getMore: function (page) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let that = this;
    let tradeUrl = app.globalData.basePath.trade;


    service({
      url: tradeUrl + "/api/v1/Trade/QueryOrderByUser",
      data: {
        userRole: 1,
        orderStatus: that.data.currentData,
        pageNo: page,
        pageSize: 6
      }
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      if (dataObj.Code == 0) {
        var res = dataObj.Data;
        res.Items.map(i => {
          if (i.UnpaidOrderItemPrice == 0) {
            i.UnpaidOrderItemPrice = i.OrderPrice
            i.payBtnShow = false
          } else {
            i.payBtnShow = true
          }
        })
        if (page > 1) {
          let orderList = that.data.orderListArr;

          that.setData({
            orderListArr: orderList.concat(res.Items)

          })

        } else {
          that.setData({
            orderListArr: res.Items
          })
        }
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
    let orderNo = that.data.orderNo;
    let orderitemid = that.data.orderitemid;
    var tradePath = app.globalData.basePath.trade;
    let payWay = that.data.payWay;

    if (payWay == 1) {
      // payWay是1就是余额支付
      service({
        url: tradePath + '/api/v1/Trade/BalancePayOrder',
        data: [{
          orderItemId: orderitemid
        }, 'data'],
        method: 'POST'
      }).then(res => {
        wx.hideLoading();
        wx.redirectTo({
          url: '../orderDetail/orderDetail?orderNo=' + orderNo
        })
      })
    } else {
      // 微信支付
      let openId = wx.getStorageSync('openid');
      let userId = that.data.walletMsg.UserId;
      service({
        url: tradePath + '/api/v1/Trade/PayOrder',
        data: [{
          userId: userId,
          openId: openId,
          orderItemId: orderitemid
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
  },

  // 确认支付
  confirmPay: function () {
    let that = this;
    that.setData({
      payWinIsShow: false
    });
    that.payMoney();
  },

  // 阻止swiper滑动事件
  stopTouchMove: function () {
    return false;
  },
})