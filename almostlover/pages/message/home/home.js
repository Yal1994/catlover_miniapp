const API = require('../../../utils/api.js');
const app = getApp()

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    TabCur: 0,
    scrollLeft: 0,
    userInfo:"",
    roomList:[],
    url: app.globalData.url,
    detailPicUrl:''
  },

onLoad(){
  let page = this;
  let uinfo = JSON.parse(wx.getStorageSync("userInfo"));
  let token = wx.getStorageSync("token");
  console.log(token)
  page.setData({
    userInfo:uinfo
  })
  //let roomList = wx.getStorageSync("roomList");

  wx.onSocketMessage(function (res) {
    let data = JSON.parse(res.data);
    console.log(res)
    if(data.errCode == 0){
      if(data.msg.type == 1){
        let roomList = data.msg.content;
        page.setData({
          roomList:roomList
        })
      }
    }
  })
},

  userHome(e) {
    let webId = e.currentTarget.dataset.webid;

    if (this.data.userInfo.webId == webId) {
      wx.switchTab({
        url: '/pages/about/home/home',
      })
    } else {
      wx.navigateTo({
        url: '/pages/user/user?webId=' + webId,
      })
    }

  },

  chat(e){
    let idx = e.currentTarget.dataset.idx;
    let room = this.data.roomList[idx];
    wx.navigateTo({
      url: '/pages/message/chat/chat?room='+JSON.stringify(room),
    })
  },

  onShow() {
    let page = this;
    let userInfo = page.data.userInfo
    let msg = { "msgType": 6, "senderId": userInfo.webId, }
    wx.sendSocketMessage({
      data: [JSON.stringify(msg)],
    })
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
  },

  tabSelect(e) {
    console.log(e);
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
  },

  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target,
      detailPicUrl: e.currentTarget.dataset.url
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
})