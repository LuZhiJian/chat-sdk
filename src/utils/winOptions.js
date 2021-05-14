import { windowCreate } from '@/winset'

const Win = {
  // 头像窗口信息
  avatar: function(data) {
    const param = {
      winInfo: {
        title: '图片展示',
        route: '#/window/avatar',
        width: 400,
        height: 424,
        minWidth: 200,
        minHeight: 224,
        backgroundColor: '#fff',
        resizable: true,
        modal: false,
        maximize: false,
        devTools: false
      },
      win: 'avatar-data',
      data: Object.assign({}, data)
    }
    windowCreate(param)
  },
  card: function(data) {
    const param = {
      winInfo: {
        title: '名片展示',
        route: '#/window/card',
        width: 336,
        height: 360,
        backgroundColor: '#fff',
        resizable: false,
        modal: true,
        maximize: false,
        devTools: true
      },
      position: true,
      win: 'card-data',
      data: Object.assign({}, data)
    }
    windowCreate(param)
  },
}
export default Win
