
// 手机号码验证
function isUnicoms(mobileNo) {
  //移动：134(0 - 8) 、135、136、137、138、139、147、150、151、152、157、158、159、178、182、183、184、187、188、198 
  //联通：130、131、132、145、155、156、175、176、185、186、166
  //电信：133、153、173、177、180、181、189、199 
  // 1，移动 2，联通 3，电信
  var move = /^((134)|(135)|(136)|(137)|(138)|(139)|(147)|(150)|(151)|(152)|(157)|(158)|(159)|(178)|(182)|(183)|(184)|(187)|(188)|(198))\d{8}$/g;
  var link = /^((130)|(131)|(132)|(155)|(156)|(145)|(185)|(186)|(176)|(175)|(170)|(171)|(166))\d{8}$/g;
  var telecom = /^((133)|(153)|(173)|(177)|(180)|(181)|(189)|(199))\d{8}$/g;
  if (move.test(mobileNo)) {
    return '1';
  } else if (link.test(mobileNo)) {
    return '2';
  } else if (telecom.test(mobileNo)) {
    return '3';
  } else {
    return '非三网号段';
  }
}
// 网络请求
function request(url, method, data, message, _success, _fail) {
  wx.showNavigationBarLoading()
  if (message != "") {
    wx.showLoading({
      title: message
    })
  }
  wx.request({
    url: url,
    data: data,
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: method,
    success: function (res) {
      _success(res)
      wx.hideNavigationBarLoading()
      if (message != "") {
        wx.hideLoading()
      }
    },
    fail: function (err) {
      if (err) {
        _fail(err)
      }
      wx.hideNavigationBarLoading()
      if (message != "") {
        wx.hideLoading()
      }
    },
  })
}

//上传语音
function up_audio(url, audioSrc, name, data, _succ, _fail) {
  const uploadTask = wx.uploadFile({
    url: url, //仅为示例，非真实的接口地址
    filePath: audioSrc,
    name: name,
    formData: data,
    header: {
      "content-type": "multipart/form-data"
    },
    success: function (res) {
      _succ(res)
    }, fail: function (err) {
      _fail(err)
    }
  })
  uploadTask.onProgressUpdate((res) => {
    console.log('audio上传进度', res.progress)
    console.log('audio已经上传的数据长度', res.totalBytesSent)
    console.log('audio预期需要上传的数据总长度', res.totalBytesExpectedToSend)
  })
}

function formatTime(unixtime) {
  var dateTime = new Date(parseInt(unixtime))
  var year = dateTime.getFullYear();
  var month = dateTime.getMonth() + 1;
  var day = dateTime.getDate();
  var hour = dateTime.getHours();
  var minute = dateTime.getMinutes();
  var second = dateTime.getSeconds();
  var now = new Date();
  var now_new = Date.parse(now.toDateString());  //typescript转换写法
  var milliseconds = now_new - dateTime;
  var timeSpanStr = hour + ':' + minute;
  // var timeSpanStr = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
  return timeSpanStr;
}
module.exports = {
  request: request,
  isUnicoms: isUnicoms,
  formatTime: formatTime,
  up_audio: up_audio
}