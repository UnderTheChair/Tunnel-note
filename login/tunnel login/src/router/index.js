import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Login from '@/components/Login'
import SignUp from '@/components/SignUp'
import PdfList from '@/components/PdfList'

Vue.use(Router)

export default new Router({
  mode : 'history',
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path:'/login',
      name : 'Login',
      component : Login
    },
    {
      path:'/signup',
      name : 'SignUp',
      component : SignUp
    },
    {
      path:'/pdflist',
      naem : 'PdfList',
      component : PdfList
    }
  ]
})