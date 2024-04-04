//封装好的排序方法
function stringKeySort(arys) {
  let obj = new Object();
  let strSort = '';
  var newkey = Object.keys(arys).sort();
  var gettype = Object.prototype.toString;
  for (var i = 0; i < newkey.length; i++) {
    var key = arys[newkey[i]];
    //if (key.constructor.name == "Object"){
    if (gettype.call(key) == "[object Object]") {
      strSort += newkey[i] + "=" + JSON.stringify(key)
    } else {
      //遍历newkey数组
      strSort += newkey[i] + "=" + arys[newkey[i]];
    }
  }
  return strSort;
}

// 验证手机号
function validatemobile(mobile) {
  if (mobile.length == 0) {
    // wx.showModal({ title: "提示", content: "手机号不能为空！", showCancel: false })
    wx.showToast({
      title: '手机号不能为空！',
      icon: 'none',
      duration: 2000,
      mask: true
    })
    return false;
  }
  if (mobile.length != 11) {
    //wx.showModal({ title: "提示", content: "手机号长度有误！", showCancel: false })
    wx.showToast({
      title: '手机号长度有误！',
      icon: 'none',
      duration: 2000,
      mask: true
    })
    return false;
  }
  var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
  var myreg1 = /^1[0-9]{10}$/;
  if (!myreg1.test(mobile)) {

    wx.showToast({
      title: '手机号有误！',
      icon: 'none',
      duration: 2000,
      mask: true
    })
    return false;
  }
  return true;
}
// 验证手机号没有提示
function validPhone(mobile) {
  if (mobile.length == 0) {
    return false;
  }
  if (mobile.length != 11) {
    return false;
  }
  var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
  var myreg1 = /^1[0-9]{10}$/;
  if (!myreg1.test(mobile)) {
    return false;
  }
  return true;
}
// 保留两位小数
function returnFloat(value) {
  var value = Math.round(parseFloat(value) * 100) / 100;
  var xsd = value.toString().split(".");
  if (xsd.length == 1) {
    value = value.toString() + ".00";
    return value;
  }
  if (xsd.length > 1) {
    if (xsd[1].length < 2) {
      value = value.toString() + "0";
    }
    return value;
  }
}
// 过滤掉表情
function emoji2Str(str) {
  return unescape(escape(str).replace(/\%uD.{3}/g, ''));
}

// 上传图片
function upLoadImg() {
  wx.chooseImage({
    count: 1,
    sizeType: 'compressed',
    success: function (res) {
      var imageSrc = res.tempFilePaths[0];
      wx.uploadFile({
        url: app.globalData.basepath + '/WeChat/Passport/UploadWebCharImg',
        filePath: imageSrc,
        name: 'data',
        formData: {
          type: "2"
        }, //  1:人员审核 2：项目提交
        success: function (res) {
          var d = JSON.parse(res.data);
          if (d.Code == 0) {
            wx.showToast({
              title: '上传成功',
              icon: 'success',
              duration: 2000
            })
            var imgData = d.Data;
            var strArr = [imageSrc, imgData];
            return strArr
          }

        },
        fail: function ({
          errMsg
        }) {

        }
      })

    },
    fail: function ({
      errMsg
    }) {

    }
  })
}
// 检验银行卡号
//银行卡号码检测
function luhnCheck(bankno) {
  var lastNum = bankno.substr(bankno.length - 1, 1); //取出最后一位（与luhn进行比较）
  var first15Num = bankno.substr(0, bankno.length - 1); //前15或18位
  var newArr = new Array();
  for (var i = first15Num.length - 1; i > -1; i--) { //前15或18位倒序存进数组
    newArr.push(first15Num.substr(i, 1));
  }
  var arrJiShu = new Array(); //奇数位*2的积 <9
  var arrJiShu2 = new Array(); //奇数位*2的积 >9
  var arrOuShu = new Array(); //偶数位数组
  for (var j = 0; j < newArr.length; j++) {
    if ((j + 1) % 2 == 1) { //奇数位
      if (parseInt(newArr[j]) * 2 < 9) arrJiShu.push(parseInt(newArr[j]) * 2);
      else arrJiShu2.push(parseInt(newArr[j]) * 2);
    } else //偶数位
      arrOuShu.push(newArr[j]);
  }

  var jishu_child1 = new Array(); //奇数位*2 >9 的分割之后的数组个位数
  var jishu_child2 = new Array(); //奇数位*2 >9 的分割之后的数组十位数
  for (var h = 0; h < arrJiShu2.length; h++) {
    jishu_child1.push(parseInt(arrJiShu2[h]) % 10);
    jishu_child2.push(parseInt(arrJiShu2[h]) / 10);
  }

  var sumJiShu = 0; //奇数位*2 < 9 的数组之和
  var sumOuShu = 0; //偶数位数组之和
  var sumJiShuChild1 = 0; //奇数位*2 >9 的分割之后的数组个位数之和
  var sumJiShuChild2 = 0; //奇数位*2 >9 的分割之后的数组十位数之和
  var sumTotal = 0;
  for (var m = 0; m < arrJiShu.length; m++) {
    sumJiShu = sumJiShu + parseInt(arrJiShu[m]);
  }

  for (var n = 0; n < arrOuShu.length; n++) {
    sumOuShu = sumOuShu + parseInt(arrOuShu[n]);
  }

  for (var p = 0; p < jishu_child1.length; p++) {
    sumJiShuChild1 = sumJiShuChild1 + parseInt(jishu_child1[p]);
    sumJiShuChild2 = sumJiShuChild2 + parseInt(jishu_child2[p]);
  }
  //计算总和
  sumTotal = parseInt(sumJiShu) + parseInt(sumOuShu) + parseInt(sumJiShuChild1) + parseInt(sumJiShuChild2);

  //计算luhn值
  var k = parseInt(sumTotal) % 10 == 0 ? 10 : parseInt(sumTotal) % 10;
  var luhn = 10 - k;

  if (lastNum == luhn) {
    return true;
  } else {
    return false;
  }
}
/**
2  * 检查银行卡号是否符合规则
3  * @param bankno 银行卡号
4  * @returns
5  */
function checkBankNo(bankno) {
  var bankno = bankno.replace(/\s/g, '');
  if (bankno == "") {
    wx.showToast({
      title: '银行卡号无效',
      icon: 'none',
      duration: 2000,
      mask: true
    })
    return false;

  }
  if (bankno.length < 16 || bankno.length > 19) {
    wx.showToast({
      title: '银行卡号无效',
      icon: 'none',
      duration: 2000,
      mask: true
    })
    return false;

  }
  var num = /^\d*$/; // 全数字
  if (!num.exec(bankno)) {
    wx.showToast({
      title: '银行卡号无效',
      duration: 2000,
      mask: true
    })
    return false;

  }
  // 开头两位
  var strBin = "10,18,30,35,37,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,58,60,62,65,68,69,84,87,88,94,95,98,99";
  if (strBin.indexOf(bankno.substring(0, 2)) == -1) {
    wx.showToast({
      title: '银行卡号有误',
      image: '/images/icon-tishi@2x.png',
      duration: 2000,
      mask: true
    })
    return false;

  }
  // luhn校验
  if (!luhnCheck(bankno)) {
    wx.showToast({
      title: '银行卡号错误',
      image: '/images/icon-tishi@2x.png',
      duration: 2000,
      mask: true
    })
    return false;

  }
  return true;

}

function showToast(title, duration) {

  wx.showToast({
    title: title,
    icon: 'none',
    duration: duration ? duration : 2000,
    mask: true
  })
}

function asterisksCard(account) {
  //区分手机号和银行卡号条件:卡号首位是否为1
  account = account.replace(/\s/g, '');
  var aLength = account.length;
  if (account[0] === '1') {
    //手机号码
    return account.substr(0, 3) + "****" + account.substring(7, 11);
  } else {
    //银行卡号
    var asterisks = "";
    var tail = aLength % 4;
    var sLenght = 0;
    var start = 0;
    if (tail != 0) {
      sLenght = aLength - 4 - tail;
      start = aLength - tail;
    } else {
      sLenght = aLength - 8;
      start = aLength - 4;
    }
    for (var i = 0; i < sLenght; i++) {
      asterisks += '*';
    }
    return account.substr(0, 4) + asterisks + account.substring(start, aLength);
  }
};

//导出去，让外部拿到==========
module.exports = {
  stringKeySort: stringKeySort,
  validatemobile: validatemobile,
  returnFloat: returnFloat,
  emoji2Str: emoji2Str,
  upLoadImg: upLoadImg,
  checkBankNo: checkBankNo,
  showToast: showToast,
  asterisksCard: asterisksCard
  // objKeySort:objKeySort
};