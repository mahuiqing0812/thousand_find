import service from "../../utils/service";

// pages/itList/itList.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isCurTerminal: '',
    terminalArr: [{
        id: 1,
        name: "小程序",
        isSele: false
      },
      {
        id: 2,
        name: "APP",
        isSele: false
      },
      {
        id: 3,
        name: "H5",
        isSele: false
      },
      {
        id: 4,
        name: "PC",
        isSele: false
      }
    ],
    itemArr: [],
    pageIndex: 1,
    curTypeData: '',
    seleTerminal: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    let that = this;
    let currentData = options.currData ? options.currData : 0;
    let currentTerData = options.terminalData ? options.terminalData : 0;
    let terminalArr = that.data.terminalArr;
    let pageIndex = that.data.pageIndex;

    setTimeout(function () {
      that.setData({
        currentData: currentData,
        seleTerminal: currentTerData
      })

    }, 500)
    // 页面顶部终端标签的选中状态
    terminalArr.map(i => {
      if (i.id == currentTerData) {
        i.isSele = true;
        that.setData({
          terminalArr: terminalArr
        })
      }
    })

    that.setData({
      curTypeData: currentData
    })

    that.getMore(pageIndex, currentTerData, currentData);
  },
  // 点击类型筛选
  checkType: function (e) {
    let that = this;
    let curDataTemp = e.currentTarget.dataset.current;
    let pageIndex = 1;
    let currentTerData = that.data.seleTerminal ? that.data.seleTerminal : 0;

    this.setData({
      curTypeData: curDataTemp,
      seleTypeData: curDataTemp,
      pageIndex: pageIndex
    })
    that.getMore(pageIndex, currentTerData, curDataTemp);

  },
  // 点击终端筛选
  checkTerminal: function (e) {
    let that = this;
    let terminalArr = that.data.terminalArr;
    // let seleTerminal = that.data.seleTerminal;
    let curId = e.currentTarget.id;
    // let curIsSele = e.currentTarget.dataset.issele;
    // let itemUrl = app.globalData.basePath.item;
    let pageIndex = 1;

    // 点击页面顶部终端筛选的选中状态
    for (let i = 0; i < terminalArr.length; i++) {
      if (terminalArr[i].id == curId) {
        terminalArr[i].isSele = !terminalArr[i].isSele;
        this.setData({
          terminalArr: terminalArr,

        })
      }
    }
    let tempArr = [];
    terminalArr.filter(i => {
      if (i.isSele) {
        tempArr.push(i.id)
      }
    })
    let dataStr = tempArr.join(",");

    that.setData({
      seleTerminal: dataStr
    })

    that.getMore(pageIndex, dataStr, that.data.curTypeData);

  },

  // 上拉加载更多
  onReachBottom: function () {
    let that = this;
    that.data.pageIndex += 1;
    let typeData = that.data.curTypeData;
    let terData = that.data.seleTerminal;
    console.log(terData)

    that.getMore(that.data.pageIndex, terData, typeData);
  },

  getMore: function (page, curTerData, curTyData) {

    wx.showLoading({
      title: '加载中',
      mask: true
    })

    let that = this;

    let itemUrl = app.globalData.basePath.item;

    //组织post查询参数
    var paras = {
      type: curTyData,
      terminal: curTerData,
      pageIndex: page,
      pageSize: 6
    };

    service({
      url: itemUrl + '/api/WeChat/Goods/GetSoftwareGoodsList',
      method: "POST",
      data: [paras, 'data'],
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      if (dataObj.Code == 0) {
        let typeArrTemp = dataObj.Data;


        //存储拉取列表数据结果
        var itemAttrs = page > 1 ? that.data.itemArr.concat(typeArrTemp) : typeArrTemp;
        that.setData({
          itemArr: itemAttrs
        })

      }
    })
  },
  skip_goodsDetail: function (e) {
    let goodsId = e.currentTarget.dataset.goodsid;
    wx.navigateTo({
      url: '../ItCommodity/ItCommodity?goodsId=' + goodsId
    })
  }

})