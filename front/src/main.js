import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'expose-loader?$!expose-loader?jQuery!jquery'
import VueSession from 'vue-session'
import store from './store'


Vue.use(VueSession)
Vue.use(BootstrapVue);


Vue.prototype.$http = axios

Vue.config.productionTip = false


new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
