import service from "../../utils/service";
import utils from "../../utils/index";
var app = getApp();
Page({
  data: {
    id: '',
    array: ['电商', '棋牌', '手游', '社交', '新闻', '其他'],
    phasetask: [1, 2, 3, 4, 5, 6],
    items: [{
        name: '小程序',
        value: '小程序'
      },
      {
        name: 'PC',
        value: 'PC'
      },
      {
        name: 'APP',
        value: 'APP'
      },
      {
        name: 'H5',
        value: 'H5'
      },
    ],
    tipInfo: '请将必填信息填写完整后进行提交！',
    //定义页面内使用数据
    itemName: '',
    type: '',
    terminal: [],
    itemPrice: '',
    itemPrice_p: '',
    itemDesc: '',
    deposit: '',
    typeindex: 0,
    taskIndex: 0,
    typeValue: '',
    taskData: {},
    taskarray: [{}],
    depositRate: 0,
    isSubmit: false,
    isMask: false,
    isPicker: true,
    isPickerfen: true,
    isTip: false,
    walletMsg: 0,
    busNo: '',
  },
  onLoad: function (options) {
    let extUrl = app.globalData.basePath.extensions;
    var self = this;
    service({
      url: extUrl + "/api/WeChat/SettingsInfo/GetSettingsInfo",
      data: {
        typeName: "发布单押金比例"
      }

    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      if (dataObj.Code == 0) {
        self.setData({
          depositRate: dataObj.Data
        });
      } else {
        console.log("得到发布单押金比例失败")
      }
    });
  },

  // 公用的检测是否提交完整
  checkData: function (self, data) {
    self.setData(
      data
    );
    self.setData({
      isSubmit: false
    });
    if (self.data.itemName == '') {
      self.setData({
        tipInfo: '请填写项目名称！'
      });
      return false;
    }
    if (self.data.typeValue == '') {
      self.setData({
        tipInfo: '请选择项目类型'
      });
      return false;
    }
    if (self.data.terminal == '' || self.data.terminal.length <= 0) {
      self.setData({
        tipInfo: '请选择支持终端'
      });
      return false;
    }
    if (self.data.itemPrice == '' || parseFloat(self.data.itemPrice) <= 0) {
      self.setData({
        tipInfo: '请填写项目金额且金额不能小于0'
      });
      return false;
    };

    //检测分期情况
    var tasknum = self.data.phasetask[self.data.taskIndex];
    var taskarray = self.data.taskarray;
    var allratio = 0;
    for (let i = 0; i < tasknum; i++) {

      if (!taskarray[i].ratio || taskarray[i].ratio == '' || taskarray[i].ratio <= 0) {
        self.setData({
          tipInfo: '请填写第' + (i + 1) + '期支付比例且比例不能小于0'
        });
        return false;
      } else {
        allratio = allratio + parseInt(taskarray[i].ratio);
      }

      if (!taskarray[i].date || taskarray[i].date == '' || taskarray[i].date <= 0) {
        self.setData({
          tipInfo: '请填写第' + (i + 1) + '期消耗时长且天数不能小于0'
        });
        return false;
      }

      if (!taskarray[i].desc || taskarray[i].desc == '') {
        self.setData({
          tipInfo: '请填写第' + (i + 1) + '期任务描述'
        });
        return false;
      }
    }
    if (allratio != 100) {
      self.setData({
        tipInfo: '所有分期支付比例总和应为100%,请检查'
      });
      return false;
    }

    self.setData({
      isSubmit: true,
      isTip: false
    })
    return true;
  },
  // 点击项目名称，触发事件
  prjNameHandle: function (e) {
    var self = this;
    self.checkData(self, {
      itemName: e.detail.value
    });
  },
  // 获取类型（如电商、手游）并设置
  bindPickerChange: function (e) {
    var self = this;
    self.setData({
      typeindex: e.detail.value,
      typeValue: this.data.array[e.detail.value],
      isPicker: false
    })
    self.checkData(self, {
      'type': e.detail.value
    });
  },

  // 支持终端
  checkboxChange: function (e) {
    var self = this;
    self.checkData(self, {
      terminal: e.detail.value
    });
  },
  // 项目价格
  priceHandle: function (e) {
    var self = this;
    var price = e.detail.value;
    if (price == 0) {

    }
    var deposit = self.data.depositRate;
    var depositTemp = (price * deposit).toFixed(2);
    self.checkData(self, {
      'itemPrice': price,
      itemPrice_p: depositTemp
    });
  },

  // 获取用户分几期
  bindPickerStageChange: function (e) {
    let taskNum = e.detail.value;
    let self = this;
    var array = new Array();
    //初始化分期信息
    for (let i = 0; i <= taskNum; i++) {
      array[i] = {};
    }

    this.setData({
      taskIndex: taskNum,
      isPickerfen: false,
      taskarray: array
    })

    self.checkData(self, {});
  },
  //分期金额比例
  taskratioHandle: function (e) {
    var self = this;
    let itemindex = e.currentTarget.dataset.itemindex;

    let array = self.data.taskarray;

    if (array.length >= itemindex) {
      array[itemindex].ratio = e.detail.value;
    }
    self.checkData(self, {
      taskarray: array
    });
  },
  //分期消耗时长
  taskDateHandle: function (e) {
    var self = this;
    let itemindex = e.currentTarget.dataset.itemindex;

    let array = self.data.taskarray;

    if (array.length >= itemindex) {
      array[itemindex].date = e.detail.value;
    }
    self.checkData(self, {
      taskarray: array
    });
  },
  //分期任务描述
  taskdescHandle: function (e) {
    var self = this;
    let itemindex = e.currentTarget.dataset.itemindex;

    let array = self.data.taskarray;

    if (array.length >= itemindex) {
      array[itemindex].desc = e.detail.value;
    }

    self.checkData(self, {
      taskarray: array
    });
  },

  itemdescHandle: function (e) {
    var self = this;
    self.checkData(self, {
      itemDesc: e.detail.value
    });
  },

  // 提交保存
  saveItem: function (e) {
    var that = this;
    var payPath = app.globalData.basePath.pay;
    that.setData({
      isTip: true
    });
    var result = that.checkData(that, {});
    if (!result) return;

    // 获取用户钱包余额
    service({
      url: payPath + "/api/v1/WeChatPay/QueryUserWallet",
      data: {
        payAmount: this.data.itemPrice_p
      }
    }).then(res => {
      wx.hideLoading();
      let dataObj = JSON.parse(res.data);
      let userId = dataObj.Data.UserId;
      if (dataObj.Code == 0) {
        let wallInfo = dataObj.Data;
        that.setData({
          walletMsg: dataObj.Data
        })
        service({
          url: payPath + "/api/v1/WeChatPay/CreatePaymentSlip",
          data: {
            userId: userId,
            amount: this.data.itemPrice_p,
            type: 6,
            remark: '发布单押金'
          }
        }).then(res => {
          wx.hideLoading();
          let dataObj = JSON.parse(res.data);
          if (dataObj.Code == 0) {
            that.setData({
              busNo: dataObj.Data
            })

            var confirmMsg = "";

            if (wallInfo.IsPay) {
              wx.showModal({
                title: '提示',
                content: '您的余额剩余' + wallInfo.AvailableBalance + '元，可以直接支付，是否使用余额支付？',
                confirmText: '余额支付',
                cancelText: '微信支付',
                confirmColor: "#ee3344",
                success(res) {
                  if (res.confirm) {
                    that.payMoney(1);
                  } else if (res.cancel) {
                    that.payMoney(0);
                  }
                }
              })
            } else {
              wx.showModal({
                title: '提示',
                content: '您的余额剩余' + wallInfo.AvailableBalance + '元，需要使用微信支付，是否继续？',
                confirmText: '微信支付',
                cancelText: '取消',
                confirmColor: "#ee3344",
                success(res) {
                  if (res.confirm) {
                    that.payMoney(10);
                  } else if (res.cancel) {
                    //that.payMoney(0);
                  }
                }
              })
            }
          } else {
            utils.showToast("生成缴费单出错");
          }
        })

      } else {
        utils.showToast("读取用户余额出错");
      }
    })
  },
  // 关闭确认支付的弹窗
  closePayConfirm: function () {
    let that = this;
    that.setData({
      payWinIsShow: false,
      showTextarea: true
    });
  },

  // 支付事件
  payMoney: function (val) {
    let that = this;
    var payPath = app.globalData.basePath.pay;
    var itemPath = app.globalData.basePath.item;
    let payWay = val; //that.data.payWay;
    let userId = that.data.walletMsg.UserId;

    var taskarray = that.data.taskarray;
    var termArray = new Array();
    for (let i = 0; i < taskarray.length; i++) {
      termArray.push({
        Term: i + 1,
        PricePercentage: taskarray[i].ratio,
        PhaseDays: taskarray[i].date,
        PhaseTask: taskarray[i].desc
      })
    }


    // 组织支付的参数
    let dataObj = {
      SellerUserId: userId,
      ProjectName: that.data.itemName,
      ProjectDesc: that.data.itemDesc,
      Price: that.data.itemPrice,
      FunctionSortName: that.data.typeValue,
      TerminalSortName: that.data.terminal.join(","),
      TotalTerm: parseInt(that.data.taskIndex) + 1,
      ProjectTermList: termArray,
      DepositMoney: that.data.itemPrice_p,
    }

    if (payWay == 1) {
      // payWay是1就是余额支付
      service({
        url: payPath + '/api/v1/WeChatPay/BalancePaymentSlip?busNo=' + that.data.busNo,
        data: [dataObj, 'data'],
        method: "POST"
      }).then(res => {
        wx.hideLoading();
        let dataObj = JSON.parse(res.data);
        if (dataObj.Code == 0) {
          let projectCode = dataObj.Data;

          wx.redirectTo({
            url: '../itemDetSeller/itemDetSeller?projectcode=' + projectCode
          })

          that.setData({
            paySuccessIsShow: true
          })

        } else {
          console.log("余额支付失败")

        }

      })
    } else {
      // 微信支付
      service({
        url: payPath + '/api/v1/WeChatPay/WechatPaymentSlip?busNo=' + that.data.busNo,
        method: "POST",
        data: [dataObj, 'data']
      }).then(res => {
        wx.hideLoading();
        let dataObj = JSON.parse(res.data);
        if (dataObj.Code == 0) {
          let payModel = dataObj.Data;
          let projectCode = payModel.projectCode;


          wx.requestPayment({
            timeStamp: payModel.timeStamp,
            nonceStr: payModel.nonceStr,
            package: payModel.package,
            signType: payModel.signType,
            paySign: payModel.sign,
            success(res) {

              wx.redirectTo({
                url: '../itemDetSeller/itemDetSeller?projectcode=' + projectCode
              })
              that.setData({
                paySuccessIsShow: true
              })
            },
            fail(res) {
              service({
                url: itemPath + "/api/Backstage/ProjectBackstage/ProjectDelete",
                data: [{
                  ProjectCode: projectCode
                }, 'data'],
                method: "POST"
              }).then(res => {
                wx.hideLoading();
                let dataObj = JSON.parse(res.data);
                if (dataObj.Code == 0) {
                  console.log("项目单删除成功")

                }
              })
            }
          });
        } else {
          console.log("微信支付失败")
        }
      })
    }
  },

  // 区分余额支付还是微信支付
  radioChange: function (e) {
    let payWay = e.detail.value == "wallet" ? 1 : 2;

    this.setData({
      payWay: payWay
    })
  },

  // 确认支付
  confirmPay: function () {
    let that = this;
    that.setData({
      payWinIsShow: false
    });
    that.payMoney();
  },

  // 取消支付事件
  cancelOrderNo: function () {
    // var payWinIsShow = this.data.payWinIsShow;
    this.setData({
      payWinIsShow: false
    })
  },
})