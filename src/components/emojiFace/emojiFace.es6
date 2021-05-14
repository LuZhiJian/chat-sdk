import EmojiJson from './emoji.json'

export default {
	name: 'emojiFace',
	components: {
	},
	data () {
		return {
      emoji: EmojiJson
		}
	},
  setup(props, context) {
    function selectHandle(key) {
      context.emit('select', key)
    }
    return {
      selectHandle
    }
  },
	mounted() {
	},
	methods: {
	}
}
