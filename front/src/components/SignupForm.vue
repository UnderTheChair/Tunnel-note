<template>
  <div class="signupForm">
    <div class="container">
      <div class="row">
        <div class="col-sm-6 col-md-offset-3" style="margin: 0 auto;">
          <div class="card">
            <article class="card-body">
              <h4 class="card-title mb-4 mt-1">Sign up</h4>
              <form role="form" id="signupForm">
                <div class="form-group">
                  <label for="inputName">성명</label>
                  <input type="text" class="form-control" id="inputName" name="name" placeholder="이름을 입력해 주세요" />
                </div>
                <div class="form-group">
                  <label for="InputEmail">이메일 주소</label>
                  <input
                    type="email"
                    class="form-control"
                    id="inputEmail"
                    name="email"
                    placeholder="이메일 주소를 입력해주세요"
                  />
                </div>
                <div class="form-group">
                  <label for="inputPassword">비밀번호</label>
                  <input
                    type="password"
                    class="form-control"
                    id="inputPassword"
                    name="password"
                    placeholder="비밀번호를 입력해주세요"
                  />
                </div>
                <div class="form-group">
                  <label for="inputPasswordCheck">비밀번호 확인</label>
                  <input
                    type="password"
                    class="form-control"
                    id="inputPasswordCheck"
                    name="passwordCheck"
                    placeholder="비밀번호 확인을 위해 다시한번 입력 해 주세요"
                  />
                </div>

              </form>
              <div class="form-group text-center">
                <button id="join-submit" class="btn btn-primary" v-on:click="reqJoin">
                  회원가입
                </button>
                <button id="cancel-submit" class="btn btn-warning" v-on:click="$router.push('/')">
                  취소
                </button>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import $ from 'jquery';

export default {
  name: "signupForm",
  data() {
    return {
      baseUrl: this.$store.getters.getBaseUrl
    }
  },
  methods: {
    reqJoin: function() {
      let url = this.baseUrl + '/users/signup';
      let form = $('#signupForm')
      let signupData = this.getFormData(form);
      
      if (this.evalSignupData(signupData) == false) {
        alert("Password Check");
        return;
      }

      this.$http.post(url, signupData).then((req) => {
        let data = req.data;
        if (data.data == "ok") {
          this.$store.commit('setPreSignup', true);
          this.$router.push('/');
        }else {
          console.log(data);
        }
      })
    },
    getFormData: function(form) {
      var unindexed_array = form.serializeArray();
      var indexed_array = {};

      $.map(unindexed_array, item => {
          indexed_array[item['name']] = item['value'];
      });

      return indexed_array;
    },
    evalSignupData: function(data) {
      if (data.password === data.passwordCheck) {
        delete data["passwordCheck"];
        return true;
      } else return false;
    }
  }
};
</script>