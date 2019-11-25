import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Signup from '../views/Signup.vue'
import Home from '../views/Home.vue'
  

Vue.use(VueRouter)

const requireAuth = () => (from, to, next) => {
  const isAuthenticated = localStorage.accessToken;
  
  if (isAuthenticated) return next()
  next('/login')
}
const requiredAuth = () => (from, to, next) => {
  const isAuthenticated = localStorage.accessToken;
  
  if (isAuthenticated) return next(to.fullPath);
  return next();
}

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    beforeEnter: requireAuth(),
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    beforeEnter: requiredAuth(),
  },
  {
    path: '/signup',
    name: 'signup',
    component: Signup,
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
