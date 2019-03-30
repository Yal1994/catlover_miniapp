const app = getApp();
const API = require('../../../utils/api.js');
const BASE64 = require('../../../utils/base64.js');
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    isCard: true,
    blog: {},
    modalName: null,
    detailPicUrl: '',
    comments: [],
    userInfo: {},
    ipt: { focus: false, type: '', item: '', webId: '', citemIdx:''},
    iptVal:'',
    send:false,
    detailPicUrl:'',
    url: app.globalData.url
  },
 

  onLoad: function(paramsEncode) {

    let uriDecode = decodeURIComponent(paramsEncode.item);
    let itemStr = BASE64.decode(uriDecode);
  
    var page = this;
    page.setData({
      userInfo: JSON.parse(wx.getStorageSync("userInfo"))
    });
    if (itemStr == undefined || itemStr == '') {
      wx.showModal({
        title: '提示',
        content: '哦豁~该猫片已经收被回喵星了yo~',
        success(res) {
          if (res.confirm) {
            wx.navigateBack({
              delta: 1
            })

          } else if (res.cancel) {
            wx.navigateBack({
              delta: 1
            })

          }
        }
      })
    } else {
      let item = JSON.parse(itemStr);
      let id = item.id;
      let ipt= { focus: false, type: 'blog', item: id }
      page.setData({
        blog: item,
        ipt:ipt
      })
      API.request(
        API.url + '/blog/comments/', 
        {
          blogId: id,
          page: 1
        },
        'GET'
      ).then(e => {
        page.setData({
          comments: e.comments
        })
      });
    }
  },

  previewImage(e){
    let page = this;
    let idx = e.currentTarget.dataset.picidx;
    let curUrls = [];
    let curUrl = page.data.blog.attachments[idx].url;
    for (let i = 0; i < page.data.blog.attachments.length; i++) {
      curUrls.push(page.data.blog.attachments[i].url);     
    }
    wx.previewImage({
      current: curUrl,
      urls: curUrls,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },

  comment(e){
    let page = this;
    let type = e.currentTarget.dataset.type;
    let item = e.currentTarget.dataset.commentid;
    let citemIdx = e.currentTarget.dataset.citemidx;
    let ipt = {};
    ipt.focus = true;
    ipt.type = type;
    ipt.item = item;
    ipt.webId = page.data.userInfo.id;
    ipt.citemIdx = citemIdx;
    page.setData({
      ipt: ipt
    })
  },

  blur(e){
  },

  sendComment(e){
    
    let page = this;
    let ipt = this.data.ipt
    let content = this.data.iptVal
    let webId = e.currentTarget.dataset.webid;
    if(content != ''){
      
      API.request(
        API.url + '/au/blog/comment',
        {
          'itemType': ipt.type,
          'itemId': ipt.item,
          'content': content,
          'webId':webId
        },
        'POST'
      ).then(res => {
        if(res.errCode == 0){
            if(ipt.type==='comment'){
              let cidx = ipt.citemIdx;

              if(cidx !== ''  && cidx !== undefined ){
                let key = page.data.comments;

                let val = [res.item].concat(key[cidx].commentChilds);
                key[cidx].commentChilds = val;

                page.setData({
                  comments: key
                })

              }
              
            }else{
              let key = [];
              key = [res.item].concat(page.data.comments);
              page.setData({
                comments:key
              })
            }

        }
        page.setData({
          ipt: { focus: false, type: 'blog', item: page.data.blog.id, citemidx:''},
          iptVal:''
        })
      })
    }else{
      wx.showToast({
        title: '输入内容不能为空哟',
        icon:"none"
      })
    }
  },

  bindKeyInput(e) {
    this.setData({
      iptVal: e.detail.value
    })
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
});