const app = getApp();
const Utils = require('../../../utils/api.js');
const BASE64 = require('../../../utils/base64.js');
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    userInfo:'',
    msgList:[],
    room:'',
    iptVal:''
  },
  /**
   * 进入房间时,需要向后台请求更新所在房间,并且更新当前聊天记录(分页需后期处理)
   * 聊天记录存在缓存中,进来后将缓存中的取出然后将新的记录存入缓存
   * 进入时需要带的参数:room:{roomId,senderId,reciverId}结构
   */
  onLoad: function (paramsEncode) {

    let uriDecode = decodeURIComponent(paramsEncode.room);
    let paramsStr = BASE64.decode(uriDecode);
    let params = JSON.parse(paramsStr)
    let page = this;
    let userInfo = JSON.parse(wx.getStorageSync("userInfo"));
    let token = wx.getStorageSync("token");
    let room = params;
    let nowMsgList = page.data.msgList;
    app.globalData.onlineRoom = room.id;
    let msgList = wx.getStorageSync(room.id + "_msgList");
    page.setData({
      userInfo: userInfo,
      msgList:msgList.length>0 ? msgList : [],
      room:room
    });
    page.bottom();
    let msg = {"msgType":2,"reciverId":room.reciver.webId,"senderId":userInfo.webId,"roomId":room.id}

    wx.sendSocketMessage({
      data: [JSON.stringify(msg)],
    })

    wx.onSocketMessage(function(res){
      let data = JSON.parse(res.data);
      let msg = data.msg;
      if(data.errCode == 0){
        let retList = [];
        if(msg.type == 3){
          //进入房间指令,先取缓存的聊天记录,再把新记录append进去         
          if (msgList.length > 0) {
            if (msg.content.unreadMessage.length > 0) {
              retList = msgList.concat(msg.content.unreadMessage);
              wx.setStorageSync(room.id + "_msgList",retList);
            }else{
              retList = msgList;
            }
          } else {
            if (msg.content.unreadMessage.length > 0) {
              retList = msg.content.unreadMessage;
              wx.setStorageSync(room.id + "_msgList", retList);
            }
          }
          page.setData({
            msgList:retList
          }) 
          page.bottom();        
        }else if(msg.type == 4){
          //收到消息
          let msgItem = msg.content;
          let curMsgList = page.data.msgList;
          curMsgList.push(msgItem);
          page.setData({
            msgList:curMsgList
          })
          page.bottom();
        }
      }
    })
   },

  onUnload(){
    let page = this;
    let userInfo = page.data.userInfo
    let msg = { "msgType": 3, "senderId": userInfo.webId, }
    wx.sendSocketMessage({
      data: [JSON.stringify(msg)],
    })
  },

  sendMessage(e){
    let page = this;
    let val = page.data.iptVal;
    let userInfo = page.data.userInfo;
    let room = page.data.room;
    if(val == '' || val == undefined){
      wx.showToast({
        title: '请输入内容',
      });
    }else{
      let msg = { "msgType": 4, 
                  "senderId": userInfo.webId,
                  "reciverId":room.reciver.webId,
                  "roomId":room.id ,
                  "content":val}
      wx.sendSocketMessage({
        data: [JSON.stringify(msg)],
      });
      page.setData({
        iptVal:''
      })
    }
    page.bottom();
  },

  bindInput(e){
    this.setData({
      iptVal: e.detail.value
    })
  },
  //聊天消息始终显示最底端
  bottom: function () {
    console.log("bottom")
    var query = wx.createSelectorQuery()
    query.select('#mainfrm').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      //res[0].top       // #the-id节点的上边界坐标
      // res[1].scrollTop // 显示区域的竖直滚动位置
      if (res != undefined) {
        wx.pageScrollTo({
          scrollTop: res[0].height,
        })
      }
    })
  }

});
