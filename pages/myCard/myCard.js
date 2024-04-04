import service from "../../utils/service";
import utils from "../../utils/index";
let app = getApp();

// pages/myCard/myCard.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bindSelect: false,
    confirm_win: false,
    mycard: false,
    cardData: {

    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let passportUrl = app.globalData.basePath.passport;
    let that = this;
    //检测是否含有银行卡
    service({
      url: passportUrl + "/api/WeChat/UserCard/GetCardList",
      data: {}
    }).then(res => {
      wx.hideLoading();

      let dataObj = JSON.parse(res.data);
      if (dataObj.Code == 0) {
        var obj = dataObj.Data[0];
        if (!obj) {
          that.setData({
            mycard: false
          });
          return;
        }
        //特殊处理银行卡号
        //obj.CardNo = utils.asterisksCard(obj.CardNo);
        obj.CardNo = obj.CardNo.replace(/[\s]/g, '').replace(/(\d{4})(?=\d)/g, "$1 ");
        obj.CardNo = obj.CardNo.substr(0, 4) + " ★★★★ ★★★★" + obj.CardNo.substr(14, obj.CardNo.length + 1);

        that.setData({
          mycard: true,
          cardData: obj
        });


      }
    })

  },

  bind_select: function () {
    this.setData({
      bindSelect: true
    })
  },
  removeBind: function () {

    this.setData({
      confirm_win: true
    })
  },
  changeBind: function () {
    wx.redirectTo({
      url: '../addCard/addCard?bindtype=1'
    })
  },
  no_cancel: function () {
    this.setData({
      confirm_win: false,
      bindSelect: false
    })
  },
  confirm_remove: function () {
    this.setData({
      confirm_win: false,
      bindSelect: false
    })

    let passportUrl = app.globalData.basePath.passport;
    var path = passportUrl + '/api/WeChat/UserCard/UnbundUserCard';
    let that = this;
    //检测是否含有银行卡
    service({
      url: path,
      data: {
        id: that.data.cardData.Id
      }
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      if (dataObj.Code == 0) {
        this.setData({
          bindSelect: false,
          confirm_win: false,
          mycard: false,
          cardData: {}
        })
      } else {
        utils.showToast(res.Message);
      }
    });
  },

  skip_addCard: function () {

    wx.redirectTo({
      url: '../addCard/addCard?bindtype=0'
    })
  }
})