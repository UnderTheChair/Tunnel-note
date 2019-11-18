<template>
  <div class="pdflist">
    <h3>pdflist</h3>
    <input type="text" v-model="email" placeholder="Email@domain.com"><br>
    <input type="password" v-model="password" placeholder="Password"><br>
    <button v-on:click="signUp">가입하기</button>
    <span>또는 <router-link to="/login">로그인</router-link> 으로 돌아가즈아</span>
  </div>
</template>
 
<script>
  export default {
    name: 'pdflist',
    data() {
      return {
      }
    },
    methods: {
    }
  }
</script>
 
<style scoped>
  .pdflist {
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
    font-size: 20px;
  }
  span {
    display: block;
    margin-top: 20px;
    font-size: 15px;
  }
</style>
