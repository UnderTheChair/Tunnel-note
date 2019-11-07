<template>
  <div class="login">
    <h3>로그인</h3>
    <input type="text" placeholder="email"><br>
    <input type="password" placeholder="password"><br>
    <button v-on:click="login">로그인</button>
    <p>만약 계정이 없다면, <router-link to="/signup">회원가입</router-link> 먼저해라 임마!</p>
  </div>
</template>
 
<script>
  export default {
    name: 'login',
    data() {
      return {
      }
    },
    methods: {
        login() {
            this.$router.replace('/')
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
