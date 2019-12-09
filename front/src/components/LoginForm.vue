<template>
  <div class="loginForm">
    <div class="card">
      <article class="card-body">
        <a v-on:click="$router.push('/signup')" class="float-right btn btn-outline-primary">Sign up</a>
        <h4 class="card-title mb-4 mt-1">Sign in</h4>
        <form id="loginForm">
          <div class="form-group">
            <label>Your email</label>
            <input class="form-control" placeholder="Email" type="email" name="email" />
          </div>
          <!-- form-group// -->
          <div class="form-group">
            <a class="float-right" href="#">Forgot?</a>
            <label>Your password</label>
            <input class="form-control" placeholder="******" type="password" name="password" />
          </div>
          <!-- form-group// -->
          <!-- form-group// -->
        </form>
        <div class="form-group">
          <button type="submit" class="btn btn-primary btn-block" v-on:click="reqLogin">Login</button>
        </div>
      </article>
    </div>
    <!-- card.// -->
    <Loading v-bind:isLoading="isLoading"/>
  </div>
</template>

<script>
import $ from "jquery";
import Loading from '@/components/Loading.vue';

export default {
  name: "LoginForm",
  data() {
    return {
      baseUrl: this.$store.getters.getBaseUrl,
      isLoading: false,
    };
  },
  methods: {
    reqLogin: function() {
      let form = $("#loginForm");
      let loginData = this.getFormData(form);
      this.isLoading = true;
      this.$store
        .dispatch("LOGIN", loginData)
        .then(res => {
          let data = res.data;
          if (res.status === 200) {
            this.noticeToastMsg(data.message);
            this.redirect();
          } else { 
            this.noticeToastMsg(data.message)
            this.isLoading = false;
          }
        })
        .catch(({ message }) => (this.msg = message));
    },
    getFormData: function(form) {
      var unindexed_array = form.serializeArray();
      var indexed_array = {};

      $.map(unindexed_array, item => {
        indexed_array[item["name"]] = item["value"];
      });

      return indexed_array;
    },
    redirect() {
      this.$router.push("/");
    },
    noticeToastMsg(msg) {
      this.$bvToast.toast(msg, {
        title: `Notice`,
        solid: true
      });
    }
  },
  components: {
    Loading
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
} */
</style>