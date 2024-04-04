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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let projectCode = options.projectcode;
    that.setData({
      projectCode: projectCode
    })

    this.getItemDet();


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
        that.getItemDet();
      } else {
        console.log("下架失败")
      }
    })

  },

  // 根据项目编号获取项目详情
  getItemDet: function () {
    let that = this;
    let itemPath = app.globalData.basePath.item;
    let projectCode = this.data.projectCode;
    service({
      url: itemPath + "/api/WeChat/Project/GetProjectDetail",
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
        console.log("得到项目详情错误")
      }
    })
  }
})