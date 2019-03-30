//index.js
//获取应用实例
const API = require('../../utils/api.js');
const app = getApp()

Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    userInfo: {},
    iptVal: '',
    files: null,
    attachType: 'img',
    url: app.globalData.url,
    detailPicUrl:'',
    refresh:true
  },

  bindKeyInput(e) {
    this.setData({
      iptVal: e.detail.value
    })
  },

  bindChooseImage(e) {
    let page = this;
    let iptVal = page.data.iptVal
    wx.chooseImage({
      success: function(res) {
        let tempFilePaths = res.tempFilePaths;
        let localFiles = page.data.files;
        let files;
        console.log(tempFilePaths)
        if (localFiles != null) {
          files = tempFilePaths.concat(localFiles);
        } else {
          files = tempFilePaths;
        }
        page.setData({
          files: files,
          iptVal: iptVal,
          refresh:false
        });
      },
    })

  },

  bindChooseVideo(e) {
    let page = this;
    let iptVal = page.data.iptVal
    wx.chooseVideo({
      success: function(res) {
        let tempFilePath = res.tempFilePath;
        let localFiles = page.data.files;
        let files;
        if (localFiles != null) {
          files = tempFilePath.concat(localFiles);
        } else {
          files = [tempFilePath];
        }
        page.setData({
          files: files,
          iptVal: iptVal,
          refresh: false
        });
      },
    })
  },

  publish(e) {
    let page = this;
    let webId = page.data.userInfo.webId;
    let content = page.data.iptVal;
    //let content = new Date();
    let files = page.data.files;
    if (content !== '' || files !== null) {
      API.request(
        API.url + "/au/blog/publish", {
          'webId': webId,
          'content': content
        },
        'POST'
      ).then(e => {
        if ((files == null || files.length == 0) && e.errCode == 0) {       
          API.showToast('发布成功',1000,'',function(){
            app.globalData.refreshHome = true;
            wx.switchTab({
              url: '/pages/main/home/home',
            })
          })
        }

        let blogId = e.blogId;
        for (let i = 0; i < files.length; i++) {
          API.uploadFile(
            API.url + '/au/blog/upload',
            files[i], {
              'webId': webId,
              'blogId': blogId
            }
          ).then(e => {
            let suc = JSON.parse(e);
            if (suc.errCode === 0) {
       
              if (i == files.length - 1) {
                let userInfo = JSON.parse(wx.getStorageSync("userInfo"));
                userInfo.blogs = userInfo.blogs + 1;
                if(userInfo.blogs < 0){
                  userInfo.blogs = 0
                }
                //wx.setStorageSync("userInfo", JSON.stringify(userInfo));
                page.setData({
                  refresh: true,
                  userInfo: userInfo
                })
                wx.showToast({
                  title: '发布成功',
                  success:e=>{
                    setTimeout(function(){
                      app.globalData.refreshHome = true;
                      wx.switchTab({
                        url: '/pages/main/home/home',
                      })
                    },800)
                  }
                })
              }
            }
          });
        }

      });
    }
  },

  removeAttachment(e) {
    let idx = e.currentTarget.dataset.idx;
    let files = this.data.files;
    files.splice(idx, 1);
    this.setData({
      files: files
    })
  },

  setAttachType(e) {
    this.setData({
      attachType: e.detail.value,
      files: null
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

  onLoad() {
    console.log("publish onload");
    let uinfo = wx.getStorageSync("userInfo");
    this.setData({
      userInfo: JSON.parse(uinfo)
    })
  },

  onShow() {
    console.log("publish onshow")
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }

    if(this.data.refresh){
      this.setData({
        iptVal: '',
        files: null,
        attachType: 'img',
        refresh:true
      })
    }
  },
  onHide(){
    this.setData({
      refresh: true
    })
  }
})