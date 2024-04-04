import service from "../../utils/service";

// pages/itemImgDet/itemImgDet.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let imgUrl = options.imgUrl;
    let extPath = app.globalData.basePath.extensions;

    this.setData({
      imgUrl: imgUrl
    })

    // 请求含二维码图片
    service({
      url: extPath + "/api/Backstage/FileInfo/QRCodeWaterMark",
      data: [{
        ImagePath: imgUrl
      }, 'data'],
      method: "POST"
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      if (dataObj.Code == 0) {

        this.setData({
          imgUrl: 'data:image/png;base64,' + dataObj.Data
        })
      }
    })
  },

  //点击保存图片
  save() {
    let that = this
    //若二维码未加载完毕，加个动画提高用户体验
    wx.showToast({
      icon: 'loading',
      title: '正在保存图片',
      duration: 1000
    })
    //判断用户是否授权"保存到相册"
    wx.getSetting({
      success(res) {
        //没有权限，发起授权
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() { //用户允许授权，保存图片到相册
              that.base64ImageHandle(that.data.imgUrl);
            },
            fail() { //用户点击拒绝授权，跳转到设置页，引导用户授权
              wx.openSetting({
                success() {
                  wx.authorize({
                    scope: 'scope.writePhotosAlbum',
                    success() {
                      that.base64ImageHandle(that.data.imgUrl);
                    }
                  })
                }
              })
            }
          })
        } else { //用户已授权，保存到相册
          that.base64ImageHandle(that.data.imgUrl);
        }
      }
    })
  },

  // savePhoto() {
  //   let that = this;
  //   let imgUrl = that.base64ImageHandle(that.data.imgUrl);
  //   console.log(imgUrl);
  // wx.downloadFile({
  //   url: that.data.imgUrl,
  //   success: function (res) {
  //     wx.saveImageToPhotosAlbum({
  //       filePath: res.tempFilePath,
  //       success(res) {
  //         wx.showToast({
  //           title: '保存成功',
  //           icon: "success",
  //           duration: 1000
  //         })
  //       }
  //     })
  //   }
  // })
  // },

  base64ImageHandle(base64) {
    // 指定图片的临时路径
    const path = wx.env.USER_DATA_PATH + '/test.png';
    // wx.arrayBufferToBase64(wx.base64ToArrayBuffer(base64Data));
    // 把base64的图片转化成ArrayBuffer数据
    // const buffer = wx.base64ToArrayBuffer(base64);
    // 获取小程序的文件系统
    var fs = wx.getFileSystemManager()
    // 把arraybuffer数据写入到临时目录中
    fs.writeFile({
      filePath: path,
      data: base64.slice(22),
      encoding: 'base64',
      success: (res) => {
        // 把临时路径下的图片，保存至相册
        wx.saveImageToPhotosAlbum({
          filePath: path,
          success: res => {
            wx.showToast({
              title: '保存成功'
            });
          },
          fail: err => {
            wx.showToast({
              title: "保存失败"
            })
          }
        });
      },
      fail: (err) => {
        console.log('base err', err);
      }
    })
  }
})