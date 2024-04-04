var app = getApp();
Page({
  data: {
    btuBottom: "", 
    currentTab: 0,
    // tabBar的数据
    items: [
      {
        "iconPath": "../../images/icon-shouye-weixuanzhong@2x.png",
        "selectedIconPath": "../../images/icon-shouye-xuanzhong@2x.png",
        "text": "首页"
      },
      {
        "iconPath": "../../images/icon-wode-xuanzhongcopy@2x.png",
        "selectedIconPath": "../../images/icon-wode-xuanzhong@2x.png",
        "text": "我的"
      },
      {
        "iconPath": "../../images/icon-kefu-weixuanzhong@2x.png",
        "selectedIconPath": "../../images/icon-kefu-xuanzhong@2x.png",
        "text": "客服"
      }
    ]
  },
  onLoad: function() {
    let isPhone = app.globalData.isIphoneX;
    if(isPhone){
      this.setData({
        btuBottom:"50rpx"
      })
    }


    
  }, 
  onShow:function(){
  },
  
  swichNav: function (e) {
    let that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  }
  
})