var API = require('../../utils/api.js');
var BASE64 = require('../../utils/base64.js');
const app = getApp();
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    ColorList: app.globalData.ColorList,
    userInfo: {},
    targetInfo: { blogs: 0, stars: 0, follows:0},
    isStar:false,
    openChat: "1",
    bgImg:'/images/me_bg.jpg',
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

  onLoad: function(e) {
    let page = this;
    var uinfo = wx.getStorageSync("userInfo");
    let info = JSON.parse(uinfo)
    let openChat = info.openChat;
    let targetId = e.webId;
    if(targetId == info.webId){
      wx.switchTab({
        url: '/pages/about/home/home',
      })
    }
    page.setData({
      userInfo: info,
      openChat: openChat
    })
       
    API.request(
      API.url+'/user/',
      {'webId':info.webId,
        'targetId': targetId},
       'GET'
    ).then(e=>{
        //let targetInfo = e.target;
      let bgImg = page.data.bgImg
      
      if (e.target.bgImg != null && e.target.bgImg != undefined && e.target.bgImg != ''){
        
        bgImg = page.data.url+e.target.bgImg
        console.log(bgImg)
      }
        page.setData({
          targetInfo: e.target,
          isStar:e.isStar,
          bgImg: bgImg
        })
    });
  },

  star:function(e){
    let page = this;
    let isStar = e.detail.value;
    let webId = page.data.userInfo.webId;
    let targetId = page.data.targetInfo.webId;
    API.request(
      API.url +'/au/user/star',
      {'isStar':isStar,"webId":webId,"targetId":targetId},
      'POST'
    ).then(e=>{
      if(e.errCode == 0){
        let targetInfo = e.targetInfo;

        let userInfo = e.userInfo;
        wx.setStorageSync("userInfo", JSON.stringify(userInfo));
  
        page.setData({
          userInfo:userInfo,
          targetInfo:targetInfo,
          isStar:isStar
        });
        let txt = "已关注";
        if(!isStar){
          txt = "取消关注"
        }
        API.showToast(txt,1000,'',function(){});
      }
    })
  },

  chat(){
    let isOpen = false;
    let targetId = this.data.targetInfo.webId
    let senderId = this.data.userInfo.webId;
    API.request(
      API.url+'/user/openChat',
      {'targetId':targetId,"webId":senderId},
      'GET'
      ).then(e=>{
        isOpen = e.isOpen;
        //let roomId = e.roomId
        if (isOpen) {
          //let room = { "senderId": senderId,"reciverId":targetId,"roomId":roomId}
          let params64 = BASE64.encode(JSON.stringify(e.room))
          let param = encodeURIComponent(params64);
          wx.navigateTo({
            url: '/pages/message/chat/chat?room=' + param,
          })
        } else {
          wx.showToast({
            title: '对方暂不接收私信',
            icon: "none"
          })
        }
      }) 
  },

  blogList(){
    wx.navigateTo({
      url: './detail/blog/blog?targetId='+this.data.targetInfo.webId,
    })
  },

  onShow() {
    
  }
})