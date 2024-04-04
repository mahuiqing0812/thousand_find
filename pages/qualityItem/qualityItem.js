var util=require('../../utils/util.js');
import service from "../../utils/service";
let app = getApp();
Page({
    data:{
        pageIndex: 0,
        pageSize: 10,
        qualityArr: [],
        itemImgUrlArr: []
    },
    onLoad(options) {
        let that = this;
        let pageIndex = that.data.pageIndex;
        let pageSize = that.data.pageSize;
        let itemUrl = app.globalData.basePath.item;

        let state = options.state;
        if(state == 1){
            wx.setNavigationBarTitle({
                title: "进行中的项目"
            })
        }else if(state == 2){
            wx.setNavigationBarTitle({
                title: "已完成的项目"
            })
        }



        service({
            url: itemUrl + "/api/WeChat/Goods/GetSoftwareGoodsList",
            data: [{PageIndex: pageIndex, pageSize: pageSize}, 'data'],
            method: "POST"
        }).then(res => {
            wx.hideLoading();
            let dataObj = JSON.parse(res.data);
            let typeArrTemp = dataObj.Data;
            if(dataObj.Code == 0){

                typeArrTemp.map(i => {
                    let cateListTap = i.CateList;
                    if (cateListTap.length != 0) {
                        for (let k = 0; k < cateListTap.length; k++) {
                            if(cateListTap[k].CategoryName == "项目属性"){
                              cateListTap.splice(k, 1);
                            }
                        }
                    };
                })
            }
            that.setData({
                qualityArr: typeArrTemp
            })
        })
    },

    skip_quaGoodsDetail: function(e) {
        let goodsid = e.currentTarget.dataset.goodsid;
        
        wx.navigateTo({url: '../ItCommodity/ItCommodity?goodsId=' + goodsid})
    }
})