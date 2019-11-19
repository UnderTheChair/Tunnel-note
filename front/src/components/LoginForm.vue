<template>
  <div class="loginForm">
    <div class="container">
      <div class="row">
        <div class="col-sm-4" style="margin: 0 auto;">
          <div class="card">
            <article class="card-body">
              <a
                v-on:click="$router.push('/signup')"
                class="float-right btn btn-outline-primary"
              >Sign up</a>
              <h4 class="card-title mb-4 mt-1">Sign in</h4>
              <form id="loginForm">
                <div class="form-group">
                  <label>Your email</label>
                  <input class="form-control" placeholder="Email" type="email" name="email"/>
                </div>
                <!-- form-group// -->
                <div class="form-group">
                  <a class="float-right" href="#">Forgot?</a>
                  <label>Your password</label>
                  <input class="form-control" placeholder="******" type="password" name="password" />
                </div>
                <!-- form-group// -->
                <div class="form-group">
                  <div class="checkbox">
                    <label>
                      <input type="checkbox"/> Save password
                    </label>
                  </div>
                  <!-- checkbox .// -->
                </div>
                <!-- form-group// -->
                <!-- form-group// -->
              </form>
              <div class="form-group" >
                <button type="submit" class="btn btn-primary btn-block" v-on:click="reqLogin">Login</button>
              </div>
            </article>
          </div>
          <!-- card.// -->
        </div>
        <!-- col.// -->
      </div>
      <!-- row.// -->
    </div>
    <!-- container.// -->
  </div>
</template>

<script>
import $ from "jquery";

export default {
  name: "LoginForm",
  data() {
    return {
      baseUrl: this.$store.getters.getBaseUrl
    };
  },
  methods: {
    reqLogin: function() {
      let url = this.baseUrl + '/users/login';
      let form = $('#loginForm')
      let loginData = this.getFormData(form);
      
      this.$http.post(url, loginData).then((req) => {
        let data = req.data;
        if (data.data == "ok") {
          console.log(data);
          
        }else {
          console.log(data);
        }
      })
    },
    getFormData: function(form) {
      var unindexed_array = form.serializeArray();
      var indexed_array = {};

      $.map(unindexed_array, item => {
        indexed_array[item["name"]] = item["value"];
      });

      return indexed_array;
    }
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