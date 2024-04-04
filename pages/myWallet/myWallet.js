import service from "../../utils/service";

// pages/myWallet/myWallet.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    amount: "",
    walletNum: "",
    tradeListArr: [],
    page: 1
  },

  /**
   * 生命周期函数--监听页面加载 
   */
  onLoad: function (options) {
    let that = this;
    let payUrl = app.globalData.basePath.pay;
    service({
      url: payUrl + "/api/v1/WechatPay/UserWallet"
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      if (dataObj.Code == 0) {
        let allMoney = dataObj.Data._availablebalance;
        that.setData({
          walletNum: allMoney
        })
      } else {
        console.log("出现错误")
      }
    })

    that.getMore(that.data.page);
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

                // 充值后重新拉取钱包信息
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
                // 充值后重新拉取列表
                that.getMore(1)


              },
              fail(res) {

              }
            })
          }
        })
      })
    }
  },
  onReachBottom: function () {
    var that = this;
    that.data.page += 1;
    that.getMore(that.data.page);
  },

  // 获取更多
  getMore: function (page) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let that = this;
    let payUrl = app.globalData.basePath.pay;

    service({
      url: payUrl + "/api/v1/WeChatPay/QueryUserTradeLog",
      data: {
        pageNo: page,
        pageSize: 6,
        tradeType: 0
      }
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      if (dataObj.Code == 0) {
        if (that.data.page > 1) {
          let orderList = that.data.tradeListArr;
          that.setData({
            tradeListArr: orderList.concat(dataObj.Data.Items)
          })
        } else {
          that.setData({
            tradeListArr: dataObj.Data.Items
          })
        }
      }
    })
  },

  inputChange: function (e) {
    let that = this;
    let amount = e.detail.value;
    that.setData({
      amount: amount
    })
  },

  // preventTouchMove: function () {

  // }, 
  skip_cashOut: function () {
    wx.redirectTo({
      url: '../../pages/cashWithdrawal/cashWithdrawal'
    });
  },
  checkDetail_payout: function (e) {
    let orderNo = e.currentTarget.dataset.orderno;
    wx.navigateTo({
      url: '../../pages/orderDetail/orderDetail?orderNo=' + orderNo
    });
  },
  skip_cashList: function () {
    wx.navigateTo({
      url: '../../pages/cashList/cashList'
    });
  },
  checkDetail_cashOut: function (e) {
    let times = e.currentTarget.dataset.createtime;

    wx.navigateTo({
      url: '../../pages/cashoutResult/cashoutResult?auditStatus=' + 2 + "&times=" + times
    });
  },
  skip_bindcard: function () {

    wx.navigateTo({
      url: '../../pages/myCard/myCard'
    });
  }
})