import service from "../../utils/service";

// pages/cashList/cashList.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageIndex: '',
    tradeListArr: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let page = 1;
    this.setData({
      pageIndex: page
    })
    this.getMore(page)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let page = this.data.pageIndex += 1;
    this.getMore(page);
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
      url: payUrl + "/api/v1/WeChatPay/SearchCashInfo",
      data: [{
        PageIndex: page,
        PageSize: 6,
      }, 'data'],
      method: 'POST'
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      if (dataObj.Code == 0) {
        if (page > 1) {
          let orderList = that.data.tradeListArr;
          that.setData({
            tradeListArr: orderList.concat(dataObj.Data.CashList)
          })
        } else {
          that.setData({
            tradeListArr: dataObj.Data.CashList
          })
        }
      }
    })
  },

  checkDetail_cashOut: function (e) {
    let auditStatus = e.currentTarget.dataset.auditstatus;
    let times = e.currentTarget.dataset.createtime;
    let auditremark = e.currentTarget.dataset.auditremark;

    wx.navigateTo({
      url: '../../pages/cashoutResult/cashoutResult?auditStatus=' + auditStatus + "&times=" + times + "&auditremark=" + auditremark
    });
  }

})