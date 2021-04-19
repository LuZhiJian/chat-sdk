<template>
  <span class="chat-mini-time">
    {{ time }}
  </span>
</template>
<script>
import dayjs from 'dayjs'
import { resetTime } from 'utils/common'

const timeTalkFilter = timestamp => {
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

export default {
  name: 'ChatTime',
  props: {
    chatTime: {
      type: String
    }
  },
  computed: {
    time() {
      return timeTalkFilter(this.chatTime)
    }
  }
}
</script>
<style lang="scss">
  .chat-mini-time {
    font-size: 10px;
    color: #999;
    line-height: 20px;
  }
</style>
