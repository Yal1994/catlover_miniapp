const app = getApp();
const API = require('../../../utils/api.js');
const Util = require('../../../utils/util.js');
const BASE64 = require('../../../utils/base64.js');
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    ColorList: app.globalData.ColorList,
    isCard:true,
    blogsList:[],
    detailPicUrl:'',
    curPage:1,
    userInfo:{},
    url: app.globalData.url
  },
 
    onLoad() {
      let page = this;
      let hasAuth = false;
      // 获取用户信息
      API.getSetting().then(e =>{     
        let uinfo = wx.getStorageSync("userInfo");
        let token = wx.getStorageSync("token")
        if (!e.authSetting['scope.userInfo'] || uinfo == '' || uinfo == undefined || token == '' || token == undefined ) {
          wx.redirectTo({
            url: '/pages/auth/auth'
          })
        } 
        else{
          let uinfo = JSON.parse(wx.getStorageSync("userInfo"));
          let token = wx.getStorageSync("token");
    
          page.setData({
            userInfo:uinfo
          });
          API.connectGET("wss://www.uzivn.cn/wx/chat?webId=" + uinfo.webId + "&token=" + token).then(e => {
            console.log("socket connect:" + e)
          });
          API.request(
            API.url+'/blog/list/',
            { page: 1 },
            'GET'
          ).then(e => {
            //let dataObj = JSON.parse(e.data);
            let blogsList = e.blogsList;
            page.setData({
              blogsList: blogsList
            })
            
          })
        }
      });
    },

    refresh(){
      let page = this;
      API.request(
        API.url + '/blog/list/',
        { page: 1 },
        'GET'
      ).then(e => {
        //let dataObj = JSON.parse(e.data);
        let blogsList = e.blogsList;
        page.setData({
          blogsList: blogsList
        })

      })
    },

    isCard(e) {
      this.setData({
        isCard: e.detail.value
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

    previewImage(e){     
      let here = this;
      let picIdx = e.currentTarget.dataset.picidx;
      let blogIdx = e.currentTarget.dataset.blogidx;
      let basicUrl = here.data.url
      let curUrl = basicUrl + "/" + here.data.blogsList[blogIdx].attachments[picIdx].url;
      let urls = [];
      for (let i = 0; i < here.data.blogsList[blogIdx].attachments.length;i++){    
        urls.push(basicUrl+"/"+here.data.blogsList[blogIdx].attachments[i].url);
      }
      wx.previewImage({
        current: curUrl,
        urls: urls,
        success: function(res) {},
        fail: function(res) {},
        complete: function(res) {},
      })
    },

  /**
* 页面上拉触底事件的处理函数
*/
  onReachBottom: function () {
    let page = this;
    let curpage = page.data.curPage;
    //let nextPage = page.data.blogsList.length < curpage * 10  ? curpage : curpage + 1;
    console.log(curpage);
    API.request(
      API.url +'/blog/list/',
      { 'page': curpage + 1 },
      'GET'
    ).then(e => {
      // let dataObj = JSON.parse(e.data);
      let blogsList = e.blogsList;
      if (Util.isNotEmpty(blogsList)) {
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


    loadMore(e){
      let page = this;
      let curpage = e.currentTarget.dataset.curpage;
      //let nextPage = page.data.blogsList.length < curpage * 10  ? curpage : curpage + 1;
      console.log(curpage);
      API.request(
        API.url +'/blog/list/',
        { 'page': curpage+1 },
        'GET'
      ).then(e => {
       // let dataObj = JSON.parse(e.data);
        let blogsList = e.blogsList;
        if (Util.isNotEmpty(blogsList)){          
          let aflist = page.data.blogsList.concat (blogsList);
          page.setData({
            blogsList: aflist,
            curPage: curpage+1
          })
        }else{
          wx.showToast({
            title: '没有更多了,快去发布一个吧~',
            icon:"none"
          })
        }
       
      })

    },

    detail(e){
      let id = e.currentTarget.dataset.idx;
      let item = this.data.blogsList[id];
      let params64 = BASE64.encode(JSON.stringify(item))
      let param = encodeURIComponent(params64);
      wx.navigateTo({
        url: '../detail/detail?item=' + param,
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
        {'webId':webId,"blogId":blogId},
        "POST"
      ).then(e=>{
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

    userHome(e) {
      let webId = e.currentTarget.dataset.webid;
      
      if(this.data.userInfo.webId == webId){
        wx.switchTab({
          url: '/pages/about/home/home',
        })
      }else{
        wx.navigateTo({
          url: '/pages/user/user?webId='+webId,
        })
      }
      
    },
 
  onShow:function () {
    let page = this;
    
    if(app.globalData.refreshHome){
      wx.showLoading({
        title: '正在加载新猫咪',
      })
      API.request(
        API.url +'/blog/list/',
        { page: 1 },
        'GET'
      ).then(e => {
        
        let blogsList = e.blogsList;
        page.setData({
          blogsList: blogsList
        })
        app.globalData.refreshHome = false;
        wx.hideLoading();
      })

      
    }
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })     
    }    
  }
});
