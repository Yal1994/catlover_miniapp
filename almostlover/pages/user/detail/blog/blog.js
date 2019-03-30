var API = require('../../../../utils/api.js');
var BASE64 = require('../../../../utils/base64.js');
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
    curPage:1,
    targetInfo:{},
    blogsList:[],
    isCard:true,
    modalName:null,
    delId:'',
    delIdx:'',
    url:app.globalData.url
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    let page = this;
    let targetId = e.targetId;
    let userInfo = JSON.parse(wx.getStorageSync("userInfo", userInfo));
    page.setData({
      userInfo: userInfo
    })
    API.request(
      API.url+'/user/blogs',
      {"webId":userInfo.webId,"targetId":targetId,"curPage":page.data.curPage},
      'GET'
    ).then(e=>{
      let targetInfo = e.targetInfo;
      let blogsList = e.targetBlogs;
      page.setData({
        targetInfo: targetInfo,
        blogsList: blogsList,
        curPage:2
      })
    })


  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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

    API.request(
      API.url+'/user/blogs',
      { "webId": webId, "targetId": targetId, "curPage": curpage},
      'GET'
    ).then(e => {
     
      let blogsList = e.targetBlogs;
      if (blogsList.length > 0) {
        let aflist = page.data.blogsList.concat(blogsList);
        page.setData({
          blogsList: aflist,
          curPage: curpage + 1
        })
      } else {
        wx.showToast({
          title: '没有更多了,快去发布一个吧~',
          icon: "none"
        })
      }

    })
  },

  loadMore(e) {
    let page = this;
    let curpage = page.data.curPage;
    let webId = page.data.userInfo.webId;
    let targetId = page.data.targetInfo.webId;
    //let nextPage = page.data.blogsList.length < curpage * 10  ? curpage : curpage + 1;
    console.log(curpage);
    API.request(
      API.url+'/user/blogs',
      { "webId": webId, "targetId": targetId, "curPage": curpage },
      'GET'
    ).then(e => {
      // let dataObj = JSON.parse(e.data);
      let blogsList = e.targetBlogs;
      if (blogsList != null && blogsList != undefined && blogsList.length > 0) {
        let aflist = page.data.blogsList.concat(blogsList);
        page.setData({
          blogsList: aflist,
          curPage: curpage + 1
        })
      } else {
        wx.showToast({
          title: '没有更多了,快去发布一个吧~',
          icon: "none"
        })
      }

    })

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

isCard(e) {
    this.setData({
      isCard: e.detail.value
    })
},

 previewImage(e) {
    let here = this;
    let picIdx = e.currentTarget.dataset.picidx;
    let blogIdx = e.currentTarget.dataset.blogidx;

    let curUrl = here.data.url+here.data.blogsList[blogIdx].attachments[picIdx].url;
    let urls = [];
    for (let i = 0; i < here.data.blogsList[blogIdx].attachments.length; i++) {
      urls.push(here.data.url +here.data.blogsList[blogIdx].attachments[i].url);
    }
    wx.previewImage({
      current: curUrl,
      urls: urls,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  

  detail(e) {
    let id = e.currentTarget.dataset.idx;
    let item = this.data.blogsList[id];
    let params64 = BASE64.encode(JSON.stringify(item))
    let param = encodeURIComponent(params64);
    wx.navigateTo({
      url: '/pages/main/detail/detail?item=' + param,
    })
  },

  star(e) {
    let here = this;

    let userInfo = JSON.parse(wx.getStorageSync("userInfo"));

    //console.log(JSON.parse(userInfo))
    let webId = userInfo.webId;
    let blogId = e.currentTarget.dataset.id;
    let idx = e.currentTarget.dataset.idx;
    API.request(
      API.url + '/au/blog/star',
      { 'webId': webId, "blogId": blogId },
      "POST"
    ).then(e => {
      if (e.isStar) {

        wx.showToast({
          title: '赞',
        });
        let stars = here.data.blogsList[idx].stars + 1;
        let val = here.data.blogsList;
        val[idx].stars = stars;
        val[idx].isStar = e.isStar;
        here.setData({
          blogsList: val
        })
      } else {
        let stars = here.data.blogsList[idx].stars - 1;
        let val = here.data.blogsList;
        val[idx].stars = stars;
        val[idx].isStar = e.isStar;
        here.setData({
          blogsList: val
        })
      }
    });
  },

  deleteBlog(){
    let page = this;
    let id = page.data.delId;
    let webId = page.data.userInfo.webId;
    let blogs = page.data.blogsList;
    let idx = page.data.delIdx;
    API.request(
      API.url +"/au/user/blogs/del",
      {"webId":webId,"blogId":id},
      'POST'
    ).then(e=>{
      blogs.splice(idx,1);
      let userInfo = e.userInfo;
      wx.setStorageSync("userInfo",JSON.stringify(userInfo));
      page.setData({
        blogsList:blogs,
        userInfo:userInfo
      });
     // API.showToast("删除成功",1000,'').then(e=>{});
      wx.showToast({
        title: '删除成功',
        success: e => {
          setTimeout(function () {
            app.globalData.refreshHome = true;
            // wx.switchTab({
            //   url: '/pages/main/home/home',
            // })
          }, 1000)
        }
      })
    })
  },

  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target,
      delId:e.currentTarget.dataset.id,
      delIdx:e.currentTarget.dataset.idx
    })
  },
  hideModal(e) {
    let modal = e.currentTarget.dataset.target;
    if (modal == 'delComfirm'){
      this.deleteBlog();
    }
    this.setData({
      modalName: null,
      delId:null,
      delIdx: null
    })
  },
})