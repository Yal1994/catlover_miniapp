var API = require('../../utils/api.js');
const app = getApp();
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    ColorList: app.globalData.ColorList,
    url: app.globalData.url
  },
  onGetUserInfo: function (e) {
    
    if (!this.logged && e.detail.userInfo) {
      
      wx.showLoading({
        title: '正在登陆...',
      })


      var userinfo = e.detail.userInfo;
      userinfo.stars = 0;
      userinfo.follows = 0;
      userinfo.blogs = 0;
      wx.setStorageSync("userInfo", JSON.stringify(userinfo));
      var localUrl = 'http://127.0.0.1:8080/wxlogin/'
      wx.login({
        success(res) {
          if (res.code) {
            // 发起网络请求
            wx.request({
              url: 'https://www.uzivn.cn/wxlogin/',//localUrl,//
              data: {
                code: res.code,
                userInfo: JSON.stringify(e.detail)
              },
              success(e){
                //登陆成功
                console.log(e);
                if(e.data.errCode == 0){
                  app.globalData.userInfo = e.data.userInfo;
                  wx.setStorageSync("userInfo", JSON.stringify(e.data.userInfo));
                  console.log(e.data.token)
                  wx.setStorageSync("token", e.data.token);
                  console.log("auth:userInfo:"+wx.getStorageSync("userInfo"))
                  wx.switchTab({
                    url: '/pages/main/home/home',
                  });
                }else{
                  wx.showToast({
                    icon:"none",
                    title: "登陆失败",
                  })
                  wx.switchTab({
                    url: '/pages/main/home/home',
                  });                 
                }
                
                // wx.switchTab({
                //   url: '/pages/main/home/home',
                // });
              },
              fail(e){
                wx.hideLoading();
                wx.showToast({
                  icon: "none",
                  title: '登陆失败,请重试',
                })
                wx.switchTab({
                  url: '/pages/main/home/home',
                });
              }
            })
          } else {
            wx.showToast({
              icon: "none",
              title: '登陆失败,请重试',
            })
            console.log('登录失败！' + res.errMsg)
          }
        }
      })
      

      app.globalData.userInfo = e.detail.userInfo;
     // console.log(app.globalData.userInfo)
      
    }
  }
});
