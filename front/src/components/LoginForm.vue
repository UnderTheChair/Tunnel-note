<template>
  <div class="loginForm">
    <div class="container">
      <div class="row">
        <div class="col-sm-4" style="margin: 0 auto;">
          <div class="card">
            <article class="card-body">
              <a v-on:click="$router.push('/signup')" class="float-right btn btn-outline-primary">Sign up</a>
              <h4 class="card-title mb-4 mt-1">Sign in</h4>
              <form>
                <div class="form-group">
                  <label>Your email</label>
                  <input name class="form-control" placeholder="Email" type="email" />
                </div>
                <!-- form-group// -->
                <div class="form-group">
                  <a class="float-right" href="#">Forgot?</a>
                  <label>Your password</label>
                  <input class="form-control" placeholder="******" type="password" />
                </div>
                <!-- form-group// -->
                <div class="form-group">
                  <div class="checkbox">
                    <label>
                      <input type="checkbox" /> Save password
                    </label>
                  </div>
                  <!-- checkbox .// -->
                </div>
                <!-- form-group// -->
                <div class="form-group">
                  <button type="submit" class="btn btn-primary btn-block">Login</button>
                </div>
                <!-- form-group// -->
              </form>
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
export default {
  name: "LoginForm",
  props: {
    msg: String
  },
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