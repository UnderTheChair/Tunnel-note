// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import firebase from 'firebase'
import './plugins/firebase'

Vue.config.productionTip = false

// const firebaseConfig = {
//   apiKey: "AIzaSyBiWqbRV7oMgeI8y7r3ig4lgp5ybHRhrQE",
//   authDomain: "tunnel-note.firebaseapp.com",
//   databaseURL: "https://tunnel-note.firebaseio.com",
//   projectId: "tunnel-note",
//   storageBucket: "tunnel-note.appspot.com",
//   messagingSenderId: "841871002267",
//   appId: "1:841871002267:web:887a17b9122ee4e1a7943e",
//   measurementId: "G-4JJ6JQDCKN"
// };
// firebase.initializeApp(firebaseConfig);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})



