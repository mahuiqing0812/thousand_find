import service from "../../utils/service";
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    moneyObj: {},
    amount: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  onShow: function () {
    let that = this;

    // 拉取钱包余额信息
    let payBaseUrl = app.globalData.basePath.pay;
    service({
      url: payBaseUrl + "/api/v1/WechatPay/UserWallet",
      method: "GET"
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      if (dataObj.Code == 0) {
        let tempObj = dataObj.Data;
        that.setData({
          moneyObj: tempObj
        })
      } else {
        console.log("拉取钱包信息错误")
      }
    })

    // 拉取用户绑定银行卡列表
    let passportUrl = app.globalData.basePath.passport;
    service({
      url: passportUrl + "/api/WeChat/UserCard/GetCardList",
      data: {}
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      if (dataObj.Code == 0) {
        if (dataObj.Data.length == 0) {
          that.setData({
            isBindCard: false
          })
        } else {
          that.setData({
            isBindCard: true
          })
        }
      }
    })
  },
  allCash: function (e) {
    let that = this;
    let allmoney = that.data.moneyObj._availablebalance;
    if (allmoney <= 0) {
      wx.showModal({
        title: "警告",
        content: "无可提现资金！",
        showCancel: false,
        confirmText: "确定",
        confirmColor: "#ee3344"
      })
    } else {
      that.setData({
        amount: allmoney
      })
    }
  },
  getInput: function (e) {
    let that = this;
    let enterNum = e.detail.value;

    that.setData({
      amount: enterNum
    })

  },

  // 提现事件
  promptCash: function () {
    let that = this;
    let payUrl = app.globalData.basePath.pay;
    let amount = that.data.amount;
    if (that.data.isBindCard) {
      if (amount == '') {
        wx.showModal({
          title: "警告",
          content: "提现金额不可为空！",
          showCancel: false,
          confirmText: "确定",
          confirmColor: "#ee3344"
        })
      } else if (amount == 0) {
        wx.showModal({
          title: "警告",
          content: "提现金额不能为0！",
          showCancel: false,
          confirmText: "确定",
          confirmColor: "#ee3344"
        })
      } else {
        service({
          url: payUrl + "/api/v1/WeChatPay/UserCashOut",
          data: [{
            amount: amount
          }, 'data'],
          method: "POST"
        }).then(res => {
          wx.hideLoading();
          let dataObj = JSON.parse(res.data);
          if (dataObj.Code == 0) {
            let times = dataObj.Data;
            wx.redirectTo({
              url: '../cashoutResult/cashoutResult?times=' + times + "&auditStatus=1",

            })
          } else {
            console.log("提现错误")
          }
        })
      }
    } else {
      console.log(that.data.isBindCard)
      wx.showModal({
        title: '提示',
        content: '您当前未绑定银行卡',
        confirmText: '去绑卡',
        cancelText: '取消',
        confirmColor: "#ee3344",
        success(res) {
          if (res.confirm) {
            that.skip_myCard();
          } else if (res.cancel) {
            // return;
          }
        }
      })
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  skip_helpCenter: function () {
    wx.navigateTo({
      url: '../helpCenter/helpCenter'
    })
  },

  skip_myCard: function () {
    wx.navigateTo({
      url: '../myCard/myCard'
    })
  },
})