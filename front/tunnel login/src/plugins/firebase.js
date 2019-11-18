import Vue from 'vue'
import * as firebase from 'firebase/app'

import 'firebase/auth'
import 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyBiWqbRV7oMgeI8y7r3ig4lgp5ybHRhrQE",
    authDomain: "tunnel-note.firebaseapp.com",
    databaseURL: "https://tunnel-note.firebaseio.com",
    projectId: "tunnel-note",
    storageBucket: "tunnel-note.appspot.com",
    messagingSenderId: "841871002267",
    appId: "1:841871002267:web:887a17b9122ee4e1a7943e",
    measurementId: "G-4JJ6JQDCKN"
  };
  firebase.initializeApp(firebaseConfig);

  Vue.prototype.$firebase = firebase