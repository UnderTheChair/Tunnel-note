<template>
  <div class="login">
  
    <h3>로그인</h3>
    <input type="text" v-model="email" placeholder="Email@domain.com"><br>
    <input type="password" v-model="password" placeholder="Password"><br>
    <button v-on:click="login">로그인</button>
    <p>만약 계정이 없다면, <router-link to="/signup">회원가입</router-link> 먼저해라 임마!</p>
  </div>
</template>
 

<script>   
    import firebase from 'firebase'

  export default {
    name: 'login',
    data() {
      return {
          email : '',
          password : ''
      }
    },
   methods: {
      login() {
        firebase.auth().signInWithEmailAndPassword(this.email, this.password).then(
          function(user) {
            alert('로그인 완료!')
          },
          function(err) {
            alert('에러 : ' + err.message)
          }
        );
      }
    }
  }
</script>
 
<style scoped>
  .login {
    margin-top: 40px;
  }
  input {
    margin: 10px 0;
    width: 20%;
    padding: 15px;
  }
  button {
    margin-top: 20px;
    width: 10%;
    cursor: pointer;
  }
  p {
    margin-top: 40px;
    font-size: 15px;
  }
  p a {
    text-decoration: underline;
    cursor: pointer;
  }
</style>
