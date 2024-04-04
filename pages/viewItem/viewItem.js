var util = require('../../utils/util.js');
import service from "../../utils/service";
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    itemlist: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let itemUrl = app.globalData.basePath.item;
    let path = '/api/WeChat/Project/GetAllProjectList';

    var paras = {
      Status: 3,
      PageIndex: 1,
      PageSize: 1000
    }

    service({
      url: itemUrl + path,
      data: [paras, 'data'],
      method: "POST"
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);

      if (dataObj.Code == 0) {
        that.setData({
          itemlist: dataObj.Data
        })
      }

    })

  },
  skip_Tallup: function (e) {
    let goodsid = e.currentTarget.dataset.goodsid;
    wx.navigateTo({
      url: '../orderTallyup/orderTallyup?projectCode=' + goodsid
    })
  }
})