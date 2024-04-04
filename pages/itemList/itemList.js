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
    pageNo: 1,
    pageSize: 10
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    // 查看订单按钮进来传的参数
    let current = options.curData;
    that.setData({
      currentData: current
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },
  // 带参数跳转详情页
  goProjectDetail: function (e) {

    let projectcode = e.currentTarget.dataset.projectcode
    wx.navigateTo({
      url: '../itemDetSeller/itemDetSeller?projectcode=' + projectcode
    })
  },


  // 填写下架原因的事件
  itemUnderReason: function (e) {
    let underReason = e.detail.value;
    this.setData({
      underReason: underReason
    })
  },

  // 点击项目下架的事件
  itemUnder: function (e) {
    let projectCode = e.currentTarget.dataset.projectcode;
    this.setData({
      itemUnderShow: true,
      projectCode: projectCode
    })
  },

  // 确认下架
  confirmUnder: function () {
    let that = this;
    let itemPath = app.globalData.basePath.item;
    // 隐藏弹出层
    that.setData({
      itemUnderShow: false
    })

    service({
      url: itemPath + "/api/WeChat/Project/ProjectListLowerShelf",
      method: "POST",
      data: [{
        ProjectCode: that.data.projectCode,
        Reason: that.data.underReason
      }, 'data']
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      if (dataObj.Code == 0) {
        that.getMore(1);
      } else {
        wx.showModal({
          title: "提示",
          content: "请填写下架原因",
          showCancel: false,
          confirmColor: "#ee3344"
        })
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
    var that = this;
    that.data.pageNo += 1;
    wx.showLoading({
      title: '加载更多',
      mask: true
    })
    that.getMore(that.data.pageNo);
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
    let itemUrl = app.globalData.basePath.item;

    service({
      url: itemUrl + "/api/WeChat/Project/GetProjectList",
      data: [{
        Status: that.data.currentData,
        PageIndex: page,
        PageSize: 6
      }, 'data'],
      method: "POST"
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);

      if (dataObj.Code == 0) {
        if (page > 1) {
          let orderList = that.data.orderListArr;

          that.setData({
            orderListArr: orderList.concat(dataObj.Data)

          })

        } else {
          that.setData({
            orderListArr: dataObj.Data
          })

        }
      }
    })
  },
})