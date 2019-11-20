import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

const resourceHost = 'http://localhost:8000'

const enhanceAccessToeken = () => {
  const {accessToken} = localStorage

  if (!accessToken) return 
  axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
}

enhanceAccessToeken()

export default new Vuex.Store({
  state: {
    baseUrl: "http://localhost:8000",
    preSignup: false,
    accessToken: null
  },
  getters: {
    getBaseUrl: state => {
      return state.baseUrl;
    },
    isPreSignup: state => {
      return state.preSignup;
    },
    isAuthenticated: () => {
      return localStorage.accessToken
    }
  },
  mutations: {
    setPreSignup(state, bool) {
      state.preSignup = bool;
    },
    LOGIN (state, {accessToken}) {
      state.accessToken = accessToken
      
      // 토큰을 로컬 스토리지에 저장
      localStorage.accessToken = accessToken
    },
    LOGOUT (state) {

      state.accessToken = null

      delete localStorage.accessToken

    }
  },
  actions: {
    LOGIN ({commit}, loginData) {
      return axios.post(`${resourceHost}/users/login`, loginData)
        .then(({data}) => {
          commit('LOGIN', data);
          axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        })
    },
    LOGOUT ({commit}) {
      axios.defaults.headers.common['Authorization'] = undefined

      commit('LOGOUT')
    },
  }
})