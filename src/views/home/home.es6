import { ChatTime } from '@/filter'
import { Avatar } from 'components'
import { updateBadge } from '@/winset'

export default {
	name: 'home',
	components: {
    ChatTime,
    Avatar
	},
	data () {
		return {
      chatSearchValue: '',
      chaattingList: [
        {
          stmp: '1617864518',
          tag: 0,
          msg: '每当大雾四起遮住了我的爱意，我都觉得没关系，我会在四下无人处等你。',
          remarkName: '',
          isOnline: 0,
          isShowOnline: 0,
          isFriend: 1,
          userInfo: {
            uid: 10002,
            nickName: '传输助手',
            icon: '',
            openId: '12200000001'
          }
        },
        {
          stmp: '1617864518',
          disturb: 0,
          tag: 2,
          unread: 2,
          msg: '每当大雾四起遮住了我的爱意，我都觉得没关系，我会在四下无人处等你。',
          remarkName: '',
          isOnline: 1,
          isShowOnline: 1,
          isFriend: 1,
          userInfo: {
            uid: 110928,
            nickName: '轻轻慕妤',
            icon: 'https://ww4.sinaimg.cn/thumb150/006Ja9YYly1g4j03rpzg3j30sg0sgju1.jpg',
            openId: '12200110928'
          }
        },
        // {
        //   uid: -10002,
        //   icon: '',
        //   nickName: '群通知',
        //   groupId: -10002,
        //   stmp: '1617790077',
        //   disturb: 0,
        //   msg: '谁谁谁 邀请 七叔 加入群聊'
        // },
        // {
        //   uid: 11009,
        //   icon: 'https://wx3.sinaimg.cn/mw690/e1a50669gy1gf3miqev92j20j60j60tg.jpg',
        //   nickName: '韭菜群韭菜群韭菜群',
        //   online: 1,
        //   groupId: 11009,
        //   stmp: '1617259718',
        //   disturb: 1,
        //   tag: 80,
        //   unread: 121,
        //   groupCount: 128,
        //   msg: '有人在吗'
        // }
      ],
      chatUser: {
        stmp: '1617864518',
        disturb: 0,
        tag: 2,
        unread: 2,
        msg: '每当大雾四起遮住了我的爱意，我都觉得没关系，我会在四下无人处等你。',
        remarkName: '',
        isOnline: 1,
        isShowOnline: 1,
        isFriend: 1,
        userInfo: {
          uid: 110928,
          nickName: '轻轻慕妤',
          icon: 'https://ww4.sinaimg.cn/thumb150/006Ja9YYly1g4j03rpzg3j30sg0sgju1.jpg',
          openId: '12200110928'
        }
      }
		}
	},
	mounted() {
    updateBadge('6')
	},
	methods: {
    clear() {
      this.chatSearchValue = ''
      this.$refs.search.focus()
    },
    chatting(item) {
      this.chatUser = item
    }
	}
}
