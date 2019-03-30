const Promise = require('../utils/promise-min.js');
const urlHead = 'https://www.uzivn.cn/wx';//"http://127.0.0.1:8080/wx"//
const YES = "1";
const NO = "0";
const socketUrl = "wss://www.uzivn.cn/wx/chat"
function getSetting(){
  return new Promise((resolve,reject) => {
    wx.showLoading({
      title: '正在加载...',
    })
    wx.getSetting({
      success:res => {
        wx.hideLoading();
        resolve(res);
      },
      error: e =>{
        wx.hideLoading();
        wx.showToast({
          title: '鉴权失败,请重试...',
          icon:'none',
          duration:2000
        })
        reject(e);
      }
    })
  })
}
/**
 * 延时提示框
 */
function showToast(txt,duration,icon,fn){
  let con = icon =='' || icon==undefined ? 'success':icon;
  let dura = duration == '' || duration == undefined ? 2000 : duration;
  wx.showToast({
    title: txt,
    icon: con,
    duration: dura,
    success:e=>{
      setTimeout(fn, dura);
    }
  })
}

function uploadFile(url,filePath,data){
  return new Promise((resolve,reject) => {
    wx.showLoading({
      title: '正在上传...',
    })
    wx.uploadFile({
      url: url,
      filePath: filePath,
      name: 'file',
      formData: data,
      success: function(res) {
        wx.hideLoading();
        
        let ret = res.data;
        console.log("succ" + ret)
        resolve(ret);
      },
      fail: function (res) { 
        reject(res)
        },
      complete: function(res) {
        console.log("finish")
      },
    })
  })
}

/**
 * 同步请求方法
 */
function request(url,data,method){
  return new Promise((resolve,reject) => {
    let contentType = "application/x-www-form-urlencoded";
    if(method == 'DELETE' || method == 'delete'){
      contentType = "application/json";
    }
    wx.showLoading({
      title: '正在加载...',
    })
      wx.request({
        url: url,
        data: data,
        header: {"content-type":contentType},
        method: method,
        dataType: "json",
        success: function(res) {
          
          wx.hideLoading();
         let ret = res.data;
          console.log(ret)
         if(ret.errCode == 0){
           resolve(ret);
         }else{
           wx.hideLoading();
           wx.showToast({
             icon: "none",
             title: '请求喵星失败,请重试...' + ret.errMsg,
             duration: 2000
           })
           reject(res.errMsg);
         }
        },
        fail: function(res) {
          wx.hideLoading();
          wx.showToast({
            icon:"none",
            title: '请求喵星失败,请重试...',
            duration:2000
          })
          reject(res);
        },
        complete: function (res) {},
      })
  });
}

function connectGET(addr) {
  return new Promise((resolve, reject) => {
    wx.connectSocket({
      url: addr,
      success: function (s) {
        resolve(true);
      },
      error: function (e) {
        reject(false);
      }
    })
  });
}

function connect(addr) {
  return new Promise((resolve, reject) => {
    wx.connectSocket({
      url: addr,
      method: 'POST',
      header: { 'content-type': 'application/json' },
      success: function (s) {
        resolve(true);
      },
      error: function (e) {
        reject(false);
      }
    })
  });
}

//发送消息
function socketSend(msg) {
  return new Promise((resolve,reject) => {
    wx.sendSocketMessage({
      data: msg,
      success: s =>{
        resolve(s);
      },
      error: e => {
        reject(e);
      }
    });
  });
}

/**登陆 */
function login(){
  return Promise((resolve,reject) => {
    wx.login({
      success: res => {
        var c = res.code;
        wx.getUserInfo({
          success: res => {
            var rawObj = {
              code: c,
              iv: res.iv,
              rawData: res.rawData,
              signature: res.signature,
              encryptedData: res.encryptedData,
              cmd: 0
            }
            console.log(rawObj)
            resolve(rawObj);
          }
        });
      },
      error: e => {
        reject('error');
      }
    });
  })
}

/**赋值 */

function setData(obj,key,val){
  return Promise((resolve,reject) => {
      obj.setData({
        key:val
      });
      resolve(true);
  })
}

module.exports = {
  getSetting: getSetting,
  connectGET: connectGET,
  connect: connect,
  socketSend: socketSend,
  login: login,
  setData: setData,
  request: request,
  url:urlHead,
  uploadFile: uploadFile,
  showToast: showToast,
  YES: YES,
  NO:NO,
  socketUrl: socketUrl
}