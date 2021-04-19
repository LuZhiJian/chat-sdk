import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import svgIcon from "./components/icons/index.vue"

const app = createApp(App)
app.component('svgIcon', svgIcon)
const requireAll = requireContext => requireContext.keys().map(requireContext)
// 第一个参数是:'./svg' => 需要检索的目录
// 第二个参数是：false => 是否检索子目录
// 第三个参数是: /.svg$/ => 匹配文件的正则
const req = require.context('./components/icons/svg', false, /\.svg$/)
requireAll(req)

app.config.globalProperties.$notify = {
  open: (type, msg, time) => {
    const obj = {
      type: type,
      msg: msg,
      time: time
    }
    return store.dispatch('setNotify', obj)
  },
  close: () => {
    const obj = {}
    return store.dispatch('setNotify', obj)
  }
}

app.use(store).use(router).mount('#app')
