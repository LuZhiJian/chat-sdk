import dayjs from 'dayjs'
import { resetTime } from 'utils'

export const timeFilter = value => {
  let timestamp = value
      // 补全为13位
  let arrTimestamp = (timestamp + '').split('');
  for (var start = 0; start < 13; start++) {
      if (!arrTimestamp[start]) {
          arrTimestamp[start] = '0';
      }
  }
  timestamp = arrTimestamp.join('') * 1;

  var minute = 1000 * 60;
  var hour = minute * 60;
  var day = hour * 24;
  var halfamonth = day * 15;
  var now = resetTime(new Date().getTime());
  var diffValue = now - timestamp;
  var weekTime = '';
  switch(new Date(timestamp).getDay()){
    case 0:
      weekTime = '周天';
      break;
    case 1:
      weekTime = '周一';
      break;
    case 2:
      weekTime = '周二';
      break;
    case 3:
      weekTime = '周三';
      break;
    case 4:
      weekTime = '周四';
      break;
    case 5:
      weekTime = '周五';
      break;
    case 5:
      weekTime = '周六';
      break;
  }
  // 数值补0方法
  var zero = function (value) {
    if (value < 10) {
        return '0' + value;
    }
    return value;
  };

  // 计算差异时间的量级
  var weekC = diffValue / (7 * day);
  var dayC = diffValue / day;
  var hourC = diffValue / hour;
  var minC = diffValue / minute;
  var T = new Date(timestamp),
  Result = zero(T.getHours()) + ':' + zero(T.getMinutes());
  // 使用
  if (weekC >= 1) {
      var date = new Date(timestamp);
      return dayjs(date).format('YY') + '/'+ zero(date.getMonth() + 1) + '/' + zero(date.getDate()) ;
  } else if (dayC > 3) {
      return weekTime+" " + Result;
  } else if (hourC > (24+new Date().getHours())) {
      return "前天 " + Result;
  } else if (hourC > new Date().getHours()) {
      return "昨天 " + Result;
  } else if (minC >= 1) {
      return Result;
  }
  return Result;
}

export const sexFilter = value => {
  let sex = ''
  switch (value) {
    case 1:
      sex = '男'
      break;
    case 2:
      sex = '女'
      break;
    case 0:
      sex = '保密'
      break;
    default:
      sex = ''
      break;
  }
  return sex
}

export const videoTimeFilter = times => {
  let result = '00:00:00';
  let minute,second
  if (times > 0) {
    minute = Math.floor((times) / 60);
    if (minute < 10) {
      minute = "0"+minute;
    }

    second = Math.floor((times - 60 * minute) % 60);
    if (second < 10) {
      second = "0"+second;
    }
    result = minute+':'+second;
  }
  return result;
}

export const fileSizeFilter = value => {
  const kb = value / 1024
  let size = ''
  if (kb >= 1024 * 1024) {
    size = Math.round((kb / 1024 / 1024) * 10) / 10 + 'GB'
  } else if (kb >= 1024) {
    size = Math.round((kb / 1024) * 10) / 10 + 'MB'
  } else if (kb >= 1) {
    size = kb.toFixed(0) + 'KB'
  } else {
    size = value + '字节'
  }
  return size
}

export const fileExline = value => {
  return value ? value.replace(/\n/g, '<br>') : ''
}

export const timeAddressFilter = userOnOrOffline => {
  if (!userOnOrOffline) return
  if(userOnOrOffline.bfshow && userOnOrOffline.online){
    return '在线'
  }
  let timestamp = userOnOrOffline.createtime || userOnOrOffline
  // 补全为13位
  let arrTimestamp = (timestamp + '').split('');
  for (var start = 0; start < 13; start++) {
      if (!arrTimestamp[start]) {
          arrTimestamp[start] = '0';
      }
  }
  timestamp = arrTimestamp.join('') * 1;

  var minute = 1000 * 60;
  var hour = minute * 60;
  var day = hour * 24;
  var halfamonth = day * 15;
  var month = day * 30;
  var now = resetTime(new Date().getTime());
  var diffValue = now - timestamp;

  // 如果本地时间反而小于变量时间
  // if (diffValue < 0) {
  //     return '刚刚';
  // }

  // 计算差异时间的量级
  var monthC = diffValue / month;
  var weekC = diffValue / (7 * day);
  var dayC = diffValue / day;
  var hourC = diffValue / hour;
  var minC = diffValue / minute;

  // 数值补0方法
  var zero = function (value) {
      if (value < 10) {
          return '0' + value;
      }
      return value;
  };

  // 使用
  if(!userOnOrOffline.bfshow && userOnOrOffline.online){
    return '近期上过线'
  } else if(!userOnOrOffline.bfshow && weekC >= 1){
    return '近期未上过线'
  } else if(!userOnOrOffline.bfshow && dayC < 7){
    return '近期上过线'
  } else if (monthC > 12 || monthC >= 1) {
      // 超过1年，直接显示年月日
      return (function () {
          var date = new Date(timestamp);
          return dayjs(date).format('YY') + '/'+ zero(date.getMonth() + 1) + '/' + zero(date.getDate()) + '在线'  ;
      })();
  } else if (weekC >= 1) {
      return parseInt(weekC) + "周前在线";
  } else if (dayC >= 1) {
      return parseInt(dayC) + "天前在线";
  } else if (hourC >= 1) {
      return parseInt(hourC) + "小时前在线";
  } else if (minC >= 1) {
      return parseInt(minC) + "分钟前在线";
  }
  return '刚刚在线';
}
export const timeTalkFilter = timestamp => {
  // 补全为13位
  let arrTimestamp = (timestamp + '').split('');
  for (var start = 0; start < 13; start++) {
      if (!arrTimestamp[start]) {
          arrTimestamp[start] = '0';
      }
  }
  timestamp = arrTimestamp.join('') * 1;

  var minute = 1000 * 60;
  var hour = minute * 60;
  var day = hour * 24;
  var halfamonth = day * 15;
  var now = resetTime(new Date().getTime());
  var diffValue = now - timestamp;
  var weekTime = '';
  switch(new Date(timestamp).getDay()){
    case 0:
      weekTime = '周天';
      break;
    case 1:
      weekTime = '周一';
      break;
    case 2:
      weekTime = '周二';
      break;
    case 3:
      weekTime = '周三';
      break;
    case 4:
      weekTime = '周四';
      break;
    case 5:
      weekTime = '周五';
      break;
    case 5:
      weekTime = '周六';
      break;
  }
  // 如果本地时间反而小于变量时间
  // if (diffValue < 0) {
  //     return '不久前';
  // }

  // 数值补0方法
  var zero = function (value) {
    if (value < 10) {
        return '0' + value;
    }
    return value;
  };

  // 计算差异时间的量级
  var weekC = diffValue / (7 * day);
  var dayC = diffValue / day;
  var hourC = diffValue / hour;
  var minC = diffValue / minute;
  var T = new Date(timestamp),
  Result = zero(T.getHours()) + ':' + zero(T.getMinutes());
  // 使用
  if (weekC >= 1) {
      var date = new Date(timestamp);
      return `${dayjs(date).format('YY')}/${zero(date.getMonth() + 1)}/${zero(date.getDate())}`
  } else if (dayC > 3) {
      return weekTime;
  } else if (hourC > (24+new Date().getHours())) {
      return "前天";
  } else if (hourC > new Date().getHours()) {
      return "昨天";
  } else if (minC >= 1) {
      return Result;
  }
  return Result;
}

export const userLionFilter = code => {
  let text = ''
  switch (code) {
    case 5113:
      text = '您还不是对方朋友，请先到APP发送添加请求'
      break;
    case 5114:
      text = '您已被对方拉入黑名单'
      break;
  }
  return text
}

export const nameFilter = name => {
  let text = name
  if (name.length > 12) {
    text = name.substr(0, 12) + '...'
  }
  return text
}

export const burnTimeFilter = time => {
  let text = ''
  const numberTime = Number(time || 0)
  if (numberTime < 60) {
    text = `${numberTime}秒`
  } else if (numberTime >= 60 && numberTime < 3600) {
    text = `${numberTime/60}分钟`
  } else if (numberTime >= 3600 && numberTime < 86400) {
    text = `${numberTime/60/60}小时`
  } else {
    text = `${numberTime/60/60/24}天`
  }
  return text
}

export const linkFilter = url => {
  let address = url.replace('http://', '').replace('https://', '')
  return address
}
