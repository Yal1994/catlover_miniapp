var API = require('../../../utils/api.js');
const app = getApp();
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    ColorList: app.globalData.ColorList,
    userInfo: {},
    openChat: "1", 
    bgImg: '/images/me_bg.jpg',
    url: app.globalData.url
  },

  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

  onLoad(){
    let uinfo = JSON.parse(wx.getStorageSync("userInfo"));

    let openChat = uinfo.openChat;
   
    let bgimg = (uinfo.bgImg == '' || uinfo.bgImg == undefined) ? this.data.bgImg : this.data.url+uinfo.bgImg;
    openChat = (openChat === '' || openChat === undefined) ? '1' : '0'
    
    this.setData({
      userInfo: uinfo,
      openChat: openChat,
      bgImg: bgimg
    });

  },

  onShow() {
    let uinfo = JSON.parse(wx.getStorageSync("userInfo"));
    this.setData({
      userInfo:uinfo
    })
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      })
    }
  },

  openChat(e){
    let page = this;
    let openOrNot = e.detail.value;
    let openChat = "1";
    let webId = page.data.userInfo.webId
    if(!openOrNot){
      openChat = "0";
    }

    API.request(
      API.url +'/au/user/openChat',
      {
          'webId':webId,'openChat':openChat
      },
      'POST'
    ).then(e=>{
      if (e.errCode == 0) {       
        page.setData({
          userInfo:e.userInfo
        });
        wx.setStorageSync("userInfo", JSON.stringify(e.userInfo));
      }
    })
    page.setData({
      openChat:openChat
    })
  },

  uploadBgImg(){
    let page = this;
    let webId = page.data.userInfo.webId
    wx.chooseImage({
      success: function(res) {
        let path = res.tempFilePaths[0];
        API.uploadFile(
          API.url +'/au/user/bgimg',
          path,
          {'webId':webId},         
        ).then(res=>{
          let e = JSON.parse(res);
          if(e.errCode == 0){
            wx.setStorageSync("userInfo", JSON.stringify(e.userInfo));
            API.showToast("封面更换成功",1000,'',function(){});
            let bgIm = page.data.url + e.userInfo.bgImg
            page.setData({
              userInfo:e.userInfo,
              bgImg: bgIm
            })
          }
        })
      },
    })  
  },

  blogList() {
    wx.navigateTo({
      url: '/pages/user/detail/blog/blog?targetId=' + this.data.userInfo.webId,
    })
  },

})