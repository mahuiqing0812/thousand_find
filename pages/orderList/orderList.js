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
    orderListArr: [],
    payWinIsShow: false,
    btnsShow: true,
    orderType: 1,
    pageNo: 1,
    pageSize: 10
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    // 查看订单按钮进来传的参数
    let currentData = options.curData;
    that.setData({
      currentData: currentData
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

  // 联系客服按钮的阻止冒泡事件
  conCustom() {

  },

  // 提交验收事件
  submityanshou: function (e) {
    let that = this;
    let orderno = e.currentTarget.dataset.orderno;
    let tradeUrl = app.globalData.basePath.trade;

    service({
      url: tradeUrl + "/api/v1/Trade/DeliverOrder",
      method: "POST",
      data: [{
        "OrderNo": orderno
      }, 'data']
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      if (dataObj.Code == 0) {
        // 刷新列表
        that.getMore(1);
        console.log("提交验收成功")
      } else {

        console.log("提交验收失败")
      }
    })
  },


  /**
   * 页面上拉触底事件的处理函数
   */
  reactBottom: function () {
    if (this.data.orderListArr.length == 0) {
      return
    }
    this.data.pageNo += 1;
    wx.showLoading({
      title: '加载更多',
      mask: true
    })
    var that = this;
    this.getMore(that.data.pageNo);
  },

  // 阻止swiper滑动事件
  stopTouchMove: function () {
    return false;
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
        userRole: 2,
        orderStatus: that.data.currentData,
        pageNo: page,
        pageSize: 6
      }
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      if (dataObj.Code == 0) {
        var res = dataObj.Data;
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

  // 跳转订单详情
  go_orderDetail_seller: function (e) {
    let orderNo = e.currentTarget.dataset.orderno;
    wx.navigateTo({
      url: '../orderDetailS/orderDetailS?orderNo=' + orderNo,

    })
  }

})