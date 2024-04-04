// pages/cashoutResult/cashoutResult.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    auditStatus: '',
    times: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let auditStatus = options.auditStatus;
    let times = options.times;
    if (auditStatus == 3) {
      let auditremark = options.auditremark;
      this.setData({

        auditremark: auditremark
      })
    }
    let hms = times.substr(11, 5);
    let newTimes = this.AddDays(times, 7) + hms;
    newTimes = newTimes.substr(0, 10);

    this.setData({
      auditStatus: auditStatus,
      times: newTimes
    })
  },

  back_wallet: function () {
    wx.redirectTo({
      url: '../myWallet/myWallet',

    })
  },
  AddDays(date, days) {
    var nd = new Date(date);
    nd = nd.valueOf();
    nd = nd + days * 24 * 60 * 60 * 1000;
    nd = new Date(nd);
    var y = nd.getFullYear();
    var m = nd.getMonth() + 1;
    var d = nd.getDate();
    if (m <= 9) m = "0" + m;
    if (d <= 9) d = "0" + d;
    var cdate = y + "-" + m + "-" + d;
    return cdate;
  }

})