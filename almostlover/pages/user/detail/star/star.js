var API = require('../../../../utils/api.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    ColorList: app.globalData.ColorList,
    userInfo:{},
    userList:[],
    targetId:'',
    curPage:1,
    isStar:true,
    nickName:'',
    modalName: null,
    delId: null,
    delIdx: null,
    url: app.globalData.url
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let page = this;
    let isStar = options.isStar === "true";
    let targetId = options.targetId;
    let nickName = options.nickName;
    let userInfo = JSON.parse(wx.getStorageSync("userInfo"));
    
    let uri = '/user/relation';
    let pageNum = page.data.curPage
    
    page.setData({
      userInfo:userInfo,
      targetId: targetId,
      isStar: isStar,
      nickName: nickName
    })
    API.request(
      API.url+uri,
      { "webId": userInfo.webId, "targetId": targetId, "pageNum": pageNum, "isStar": isStar},
      'GET'
      ).then(e=>{
        let userList = e.userList;
        if(userList.length > 0){
          page.setData({
            userList:userList,
            curPage:pageNum+1
          })
        }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let page = this;
    let curpage = page.data.curPage;
    let webId = page.data.userInfo.webId;
    let targetId = page.data.targetInfo.webId;
    let isStar = page.data.isStar
    let uri = '/user/relation';
    
    API.request(
      API.url+'/user/blogs',
      { "webId": webId, "targetId": targetId, "pageNum": curpage,"isStar":isStar },
      'GET'
    ).then(e => {

      let userList = e.userList;
      if (userList.length > 0) {
        let aflist = page.data.userList.concat(userList);
        page.setData({
          userList: aflist,
          curPage: curpage + 1
        })
      } else {
        wx.showToast({
          title: '没了,人家也是有底线的',
          icon: "none"
        })
      }

    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},

  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target,
      delId: e.currentTarget.dataset.id,
      delIdx: e.currentTarget.dataset.idx
    })
  },

  hideModal(e) {
    let modal = e.currentTarget.dataset.target;
    if (modal == 'delComfirm') {
      this.cancelStar();
    }
    this.setData({
      modalName: null,
      delId: null,
      delIdx: null
    })
  },

  cancelStar() {
    let page = this;
    let id = page.data.delId;
    let webId = page.data.userInfo.webId;
    let userList = page.data.userList;
    let idx = page.data.delIdx;
    API.request(
      API.url + "/au/user/star",
      { "webId": webId, "targetId": id,"isStar":false },
      'POST'
    ).then(e => {
      userList.splice(idx, 1);
    //  console.log(e);
      let userInfo = e.userInfo;
      wx.setStorageSync("userInfo", JSON.stringify(userInfo));
      page.setData({
        userList: userList,
        userInfo: userInfo
      });
      // API.showToast("删除成功",1000,'').then(e=>{});
      wx.showToast({
        title: '已取消关注',
        success: e => {
          setTimeout(function () {
            app.globalData.refreshHome = true;
          }, 1000)
        }
      })
    })
  },
})