import service from "../../utils/service";

let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsMsgObj: {},
    ensureTagsArr: [],
    bannerImgArr: [],
    goodsDetailArr: [],
    shareImg: [],
    goodsDetId: '',
    xuanfuIsshow: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let itemUrl = app.globalData.basePath.item;
    let passportUrl = app.globalData.basePath.passport;
    let goodsId = options.goodsId || options.goodsid;
    let token = wx.getStorageSync('token');

    if (options.q) {
      let scan_url = decodeURIComponent(options.q);
      let platform_id = common.gup('id', scan_url);
      that.setData({
        goodsId: platform_id,
        // shareUid: shareUid
      })

      function gup(name, url) {
        if (!url) url = location.href;
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(url);
        return results == null ? null : results[1];
      }
    }



    // 根据token获取用户id


    // 判断是否通过分享进入程序
    if (options.shareUid) {

      that.setData({
        xuanfuIsshow: true,
        userId: options.shareUid
      })
    } else {
      that.setData({
        xuanfuIsshow: false
      })

      service({
        url: passportUrl + "/api/WeChat/UserInfo/GetUserIdByToken",
        data: {
          token: token
        }
      }).then(res => {
        let dataObj = JSON.parse(res.data);
        if (dataObj.Code == 0) {
          that.setData({
            userId: dataObj.Data
          })
        }
      })
    }

    // 根据案例id获取案例实体
    service({
      url: itemUrl + "/api/WeChat/Goods/GetSoftwareGoodsModel",
      data: [{
        goodsId: goodsId
      }, 'data'],
      method: "POST"
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      let goodsDetail = dataObj.Data;
      let dataTempArr = dataObj.Data.EnsureSortList;
      let allImgList = goodsDetail.GoodsImagesList;
      let attrArr = dataObj.Data.CateList;
      let banImg = [];
      let detailImg = [];
      let shareImg = [];
      allImgList.map(i => {
        if (i.ImageType == 2) {
          banImg.push(i);
        } else if (i.ImageType == 3) {
          detailImg.push(i);

        } else if (i.ImageType == 4) {
          shareImg.push(i);
        } else if (i.ImageType == 5) {
          let temp = [];
          temp.push(i);
          app.globalData.shareImgList = temp;
        }
      })
      that.setData({
        goodsMsgObj: goodsDetail,
        ensureTagsArr: dataTempArr,
        bannerImgArr: banImg,
        goodsDetailArr: detailImg,
        shareImg: shareImg,
        attrArr: attrArr
      })
    })
  },
  // 跳转案例分享列表图
  skip_itemImglist: function () {
    let userid = this.data.userId;
    let goodsid = this.data.goodsId;

    wx.navigateTo({
      url: '../itemImgList/itemImgList?userid=' + userid + "&goodsid=" + goodsid

    })
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function (res) {
  //   let that = this;
  //   let shareImgUrl = that.data.shareImg[0].ImageUrl;
  //   let shareTitle = that.data.goodsMsgObj.GoodsTitle;
  //   let goodsid = that.data.goodsId;
  //   let id = wx.getStorageSync('openid');
  //   if (res.from === 'button') {
  //     // 来自页面内转发按钮
  //     // console.log(res.target)
  //   }
  //   return {
  //     title: shareTitle,
  //     imageUrl: shareImgUrl,
  //     path: '/pages/ItCommodity/ItCommodity?shareUid=' + id + "&goodsid=" + goodsid
  //   }
  // },

  // 点击悬浮按钮跳转首页
  // skip_index: function() {
  //   wx.navigateTo({
  //     url: '/pages/index/index',

  //   })
  // }
})