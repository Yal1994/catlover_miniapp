  
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

   return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  //return [month, day,hour, minute].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const translate = date => {
  var tt = new Date(parseInt(tm) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ")
  return tt;
}

//数组去重
function contains(arr, obj) {
  var i = arr.length;
  while (i--) {
    if (arr[i] === obj) {
      return true;
    }
  }
  return false;
}

function isNotEmpty(obj){
  if(obj != null && obj != undefined && obj != '' && obj != 0){
    return true;
  }
  return false;
}

module.exports = {
  formatTime: formatTime,
  contains: contains,
  isNotEmpty: isNotEmpty,
  translate: translate
}