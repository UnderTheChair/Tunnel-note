import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import Vuex from 'vuex'
import 'expose-loader?$!expose-loader?jQuery!jquery'

Vue.use(Vuex)
Vue.use(BootstrapVue);


Vue.prototype.$http = axios

Vue.config.productionTip = false

const store = new Vuex.Store({
  state: {
    baseUrl: "http://localhost:8000",
    preSignup: false,
  },
  getters: {
    getBaseUrl: state => {
      return state.baseUrl;
    },
    isPreSignup: state => {
      return state.preSignup;
    }
  },
  mutations: {
    setPreSignup(state, bool) {
      state.preSignup = bool;
    }
  }
})


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
