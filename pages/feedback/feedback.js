import service from "../../utils/service";
import utils from "../../utils/index";

// pages/feedback/feedback.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uploadimages: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  chooseImage(e) {
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'], //可选择原图或压缩后的图片
      // sourceType: ['album', 'camera'], //可选择性开放访问相册、相机
      success: res => {
        // console.log(res.tempFilePaths)
        let imgUrl = res.tempFilePaths;
        const images = this.data.uploadimages.concat(imgUrl);
        // 限制最多只能留下4张照片
        const images1 = images.length <= 4 ? images : images.slice(0, 4);

        wx.uploadFile({

          url: app.globalData.basePath.extensions + '/api/Backstage/FileInfo/FileUpload?fileUploadType=2',
          method: "POST",
          filePath: imgUrl[0],
          name: 'data',

          success: function (res) {
            let dataObj = JSON.parse(res.data);
            let imgTemp = that.data.uploadimages;
            if (dataObj.Code == 0) {
              imgTemp.push(app.globalData.basePath.extensions + dataObj.Data);
              that.setData({
                uploadimages: imgTemp
              })
            }
          }
        })

      }
    })



  },

  // 取消上传
  removeImage(e) {
    var that = this;
    var images = that.data.uploadimages;
    // 获取要删除的第几张图片的下标
    const idx = e.currentTarget.dataset.idx;
    images.splice(idx, 1);
    this.setData({
      uploadimages: images
    })
  },

  // 预览图片
  handleImagePreview(e) {
    const idx = e.target.dataset.idx;
    const images = this.data.uploadimages;
    wx.previewImage({
      current: images[idx], //当前预览的图片
      urls: images, //所有要预览的图片
    })
  },

  // 获取输入的意见内容
  getOpinion: function (e) {
    this.setData({
      opinion: e.detail.value
    })
  },

  // 获取联系方式
  phonechange: function (e) {
    this.setData({
      contactWay: e.detail.value
    })
  },

  // bindblur: function () {
  //   if (!utils.validatemobile(this.data.contactWay)) return;

  // },

  // 提交事件
  submitFeedBack: function () {

    let contactWay = this.data.contactWay;
    let opinion = this.data.opinion;
    let imgList = this.data.uploadimages;
    let passportUrl = app.globalData.basePath.passport;

    service({
      url: passportUrl + "/api/WeChat/UserInfo/SendFeedback",
      method: "POST",
      data: [{
        Phone: contactWay,
        Content: opinion,
        ImagesList: imgList
      }, 'data']
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      if (dataObj.Code == 0) {
        wx.showToast({
          title: "提交成功",
          icon: "success"
        })
      } else {
        console.log("提交失败");
      }
    })

  }
})