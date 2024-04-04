import service from "../../utils/service";
var WxParse = require('../../wxParse/wxParse.js');
const app = getApp();

// pages/noticeDetail/noticeDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    noticeListArr: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let exturl = app.globalData.basePath.extensions;
    service({
      url: exturl + "/api/WeChat/WxNotice/GetNoticeList"
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      if (dataObj.Code == 0) {
        dataObj.Data.map(i => {
          i.CreatorTime = i.CreatorTime.substr(0, 10).replace(/\//g, "-");

        })


        WxParse.wxParse('content', 'html', dataObj.Data[0].NoticContent, that, 5),
          that.setData({
            noticeListArr: dataObj.Data,
          })

      } else {
        console.log("获取失败")
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

})