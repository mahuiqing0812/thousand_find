import service from "../../utils/service";

// pages/itemDetSeller/itemDetSeller.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    itemMsg: {},
    terminalStr: '',
    itemUnderShow: false,
    underReason: '',
    state: 2
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let orderNo = options.orderNo;
    that.setData({
      orderNo: orderNo
    })

    this.getOrderDet();


  },

  // 填写下架原因的事件
  itemUnderReason: function (e) {
    let underReason = e.detail.value;
    this.setData({
      underReason: underReason
    })
  },

  // 点击项目下架的事件
  itemUnder: function () {
    this.setData({
      itemUnderShow: true
    })
  },



  // 确认下架
  confirmUnder: function () {
    let that = this
    let itemPath = app.globalData.basePath.item;
    // 隐藏弹出层
    that.setData({
      itemUnderShow: false
    })

    service({
      url: itemPath + "/api/WeChat/Project/ProjectListLowerShelf",
      method: "POST",
      data: [{
        ProjectCode: that.data.projectCode
      }, 'data']
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      if (dataObj.Code == 0) {
        that.getOrderDet();
      } else {
        console.log("下架失败")
      }
    })

  },

  // 根据订单编号获取订单详情
  getOrderDet: function () {
    let that = this;
    let tradePath = app.globalData.basePath.trade;
    let orderNo = this.data.orderNo;
    service({
      url: tradePath + "/api/v1/Trade/QueryTradeByOrderNo",
      data: {
        orderNo: orderNo
      }
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      if (dataObj.Code == 0) {
        let res = dataObj.Data;
        let tempArr = [];

        // 起止时间数据处理
        res.OrderItemList.map(i => {
          i.StarTime = i.StarTime.substr(0, 10)
          i.EndTime = i.EndTime.substr(0, 10)
        })
        that.setData({
          itemMsg: res,
        })

      } else {
        console.log("得到项目详情错误")
      }
    })
  },

  // 提交验收事件
  submityanshou: function () {
    let that = this;
    let orderNo = that.data.orderNo;
    let tradePath = app.globalData.basePath.trade;
    service({
      url: tradePath + "/api/v1/Trade/DeliverOrder",
      method: "POST",
      data: [{
        "OrderNo": orderNo
      }, 'data']
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      if (dataObj.Code == 0) {
        that.getOrderDet();
        console.log("提交验收成功")
      } else {

        console.log("提交验收失败")
      }
    })
  }
})