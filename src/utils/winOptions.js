import { windowCreate } from '@/winset'

const Win = {
  // 头像窗口信息
  avatar: function(data) {
    const param = {
      winInfo: {
        title: '头像展示',
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
        devTools: false
      },
      position: true,
      win: 'card-data',
      data: Object.assign({}, data)
    }
    windowCreate(param)
  },
  // media媒体展示
  media: function(data) {
    const param = {
      winInfo: {
        title: '视频图片媒体展示',
        route: '#/window/media',
        width: 400,
        height: 424,
        minWidth: 200,
        minHeight: 240,
        maxWidth: 1920,
        maxHeight: 1080,
        backgroundColor: '#fff',
        resizable: true,
        modal: false,
        maximize: true,
        devTools: false
      },
      win: 'media-data',
      data: Object.assign({}, data)
    }
    windowCreate(param)
  },
}
export default Win
