<template>
  <div class="signupForm">
    <div class="card">
      <article class="card-body">
        <h4 class="card-title mb-4 mt-1">Sign up</h4>
        <form role="form" id="signupForm">
          <div class="form-group">
            <label for="inputName">Name</label>
            <input
              type="text"
              class="form-control"
              id="inputName"
              name="name"
              placeholder="Enter Name"
            />
          </div>
          <div class="form-group">
            <label for="InputEmail">Email</label>
            <input
              type="email"
              class="form-control"
              id="inputEmail"
              name="email"
              placeholder="Enter Email"
            />
          </div>
          <div class="form-group">
            <label for="inputPassword">Password</label>
            <input
              type="password"
              class="form-control"
              id="inputPassword"
              name="password"
              placeholder="Enter Password"
            />
          </div>
          <div class="form-group">
            <label for="inputPasswordCheck">Confirm Password</label>
            <input
              type="password"
              class="form-control"
              id="inputPasswordCheck"
              name="passwordCheck"
              placeholder="Enter Confirm Password"
            />
          </div>
        </form>
        <div class="form-group text-center">
          <button id="join-submit" class="btn btn-primary" v-on:click="reqJoin">Signup</button>
          &nbsp;
          <button id="cancel-submit" class="btn btn-warning" v-on:click="$router.go(-1)">Cancle</button>
        </div>
      </article>
    </div>
    <Loading v-bind:isLoading='isLoading'/>
  </div>
</template>
<script>
import $ from "jquery";
import Loading from '@/components/Loading.vue';

export default {
  name: "signupForm",
  data() {
    return {
      baseUrl: this.$store.getters.getBaseUrl,
      isLoading: false
    };
  },
  methods: {
    reqJoin: function() {
      let url = this.baseUrl + "/users/signup";
      let form = $("#signupForm");
      let signupData = this.getFormData(form);

      if (this.evalSignupData(signupData) == false) {
        this.noticeToastMsg("Passwords are different");
        return;
      }
      this.isLoading = true;
      this.$http.post(url, signupData).then(res => {
        let data = res.data;
        if (data.data == "ok") {
          this.$store.commit("setPreSignup", true);
          this.$router.push("/login");
        } else {
          if (data.code === 11000) {
            this.noticeToastMsg("Email duplication");
            this.isLoading = false;
          }
        }
      });
    },
    getFormData: function(form) {
      var unindexed_array = form.serializeArray();
      var indexed_array = {};

      $.map(unindexed_array, item => {
        indexed_array[item["name"]] = item["value"];
      });

      return indexed_array;
    },
    evalSignupData: function(data) {
      if (data.password === data.passwordCheck) {
        delete data["passwordCheck"];
        return true;
      } else return false;
    },
    noticeToastMsg: function(msg) {
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