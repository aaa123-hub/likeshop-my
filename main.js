import Vue from 'vue'
import App from './App'
import store from './store'
import {toast, copy} from './utils/tools'
import Cache from './utils/cache'
import minxinsApp from '@/mixins/app'
import uViewLite from '@/utils/uview-lite'
Vue.prototype.$toast = toast
Vue.prototype.$copy = copy
Vue.prototype.$Cache = Cache
Vue.config.productionTip = false


App.mpType = 'app'
Vue.use(uViewLite)
Vue.mixin(minxinsApp);
const app = new Vue({
    ...App,
	store
})
app.$mount()
