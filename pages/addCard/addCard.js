import service from "../../utils/service";
import utils from "../../utils/index";

let app = getApp();

// pages/addCard/addCard.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    OpenBankUserName: '',
    CardNo: '',
    OpenBank: '',
    OpenPhone: '',
    BindType: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      BindType: options.bindtype
    });
  },


  skip_addCard_success: function () {
    let passportUrl = app.globalData.basePath.passport;
    let that = this.data;
    //检测参数信息
    if (that.OpenBankUserName == '') {
      utils.showToast("请输入持卡人姓名");
      return;
    }

    if (!utils.checkBankNo(that.CardNo)) return;
    if (!utils.validatemobile(that.OpenPhone)) return;

    if (that.OpenBank == '') {
      utils.showToast("请输入开户行，如：招商银行望京融科支行");
      return;
    }

    var paras = {
      "OpenBankUserName": that.OpenBankUserName,
      "CardNo": that.CardNo,
      "OpenBank": that.OpenBank,
      "OpenPhone": that.OpenPhone,
      "Status": 1
    };

    let path = passportUrl + "/api/WeChat/UserCard/";
    path = path + (that.BindType == 1 ? 'ChangeUserCard' : 'add');

    service({
      url: path,
      method: "POST",
      data: [paras, 'data']
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      if (dataObj.Code == 0) {
        wx.redirectTo({
          url: '../myCard/myCard'
        })
      } else {
        utils.showToast("银行卡添加失败");
      }
    })


  },
  handlenameinput: function (e) {
    this.setData({
      OpenBankUserName: e.detail.value
    });
  },
  handlenoinput: function (e) {
    this.setData({
      CardNo: e.detail.value
    });
  },
  handlebankinput: function (e) {
    this.setData({
      OpenBank: e.detail.value
    });
  },
  handlephoneinput: function (e) {
    this.setData({
      OpenPhone: e.detail.value
    });
  },
})