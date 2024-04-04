/**
 * 封装请求方法
 * add by duqiao 
 */
import utilSha1 from "../utils/sha1.js";
import utilSort from "../utils/index.js";
//var CryptoJS = utilSort.CryptoJS;
var app = getApp()
export default (opts) => {
  // 是否需要加载弹出框
  if (!opts.refresh) {
    wx.showLoading({
      title: opts.title || '数据加载中',
      mask: true
    })
  }
  //进行加密======================================
  //获取请求参数
  var data = opts.data || {};
  //获取请求方法
  var method = opts.method || 'GET';

  //获取时间戳
  var timestamp = Date.parse(new Date());
  timestamp = timestamp / 1000;
  var appkey = '2dd40304e7d382c6d5f19f7d88f39536b0f6ca44';
  var appsecret = 'aaec6aa7d247ba82b2bf175aaea5e52413a621cb';
  //创建一个对象用于接受appkey,appsercet,data,用来进行排序
  var obj = new Object();
  var newData = new Object();
  //获取token
  var token = wx.getStorageSync('token');

  if (token || token != '') {
    obj.token = token
  }
  obj.appkey = appkey;
  obj.timestamp = timestamp;
  //判断是get请求还是post请求
  if (method == 'GET') {
    obj = Object.assign(obj, data);
    newData = data;
  } else {
    if (typeof data[0] != 'undefined')
      obj[data[1]] = data[0];
    newData = data[0];
  }
  //进行排序
  var sort = utilSort.stringKeySort(obj);
  //去掉所有的空格
  sort = sort.replace(/\s/ig, '');
  //去掉所有的回车换行
  sort = sort.replace(/[\r\n]/g, "");
  var str = sort + appsecret;
  // console.log(str);
  //获取签名
  var sign = utilSha1.CryptoJS.SHA1(str).toString();
  //转大写
  sign = sign.toUpperCase();
  if (token && token != '') {
    // 获取请求头
    var header = opts.header || {
      'appkey': appkey,
      'timestamp': timestamp,
      'sign': sign,
      'token': token
    }
  } else {
    var header = opts.header || {
      'appkey': appkey,
      'timestamp': timestamp,
      'sign': sign
    }
  }
  // var basic;
  return new Promise((resolve, reject) => {
    wx.request({
      // url: app.globalData.basepath + opts.url || '',
      url: opts.url || '',
      data: newData || {},
      dataType: opts.dataType || 'JSON',
      method: opts.method || 'GET',
      // header: Object.assign(opts.header, { 'appkey': appkey,'timestamp':timestamp,'sign':sign}),
      header: header,
      success: (res) => {
        resolve(res)
        typeof opts.success === 'function' && opts.success(res)
      },
      fail: (res) => {
        reject(res)
        typeof opts.fail === 'function' && opts.fail(res);
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: '请求超时，请稍候再试！',
          showCancel: false
        })
      },
      complete: (res) => {
        // opts.complete(res)        
      }
    })
  })
}