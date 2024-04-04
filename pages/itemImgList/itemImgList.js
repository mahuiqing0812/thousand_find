// pages/itemImgList/itemImgList.js

const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shareImgList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userId = options.userid;
    let goodsId = options.goodsid;
    this.setData({
      shareImgList: app.globalData.shareImgList,
      goodsId: goodsId,
      userId: userId
    })


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  skip_itemImgDet: function (e) {
    let imgUrl = e.currentTarget.dataset.imgurl;
    let userId = this.data.userId;
    let goodsId = this.data.goodsId;
    wx.navigateTo({
      url: '../itemImgDet/itemImgDet?imgUrl=' + imgUrl + "&userid=" + userId + "&goodsid=" + goodsId
    })
  }
})