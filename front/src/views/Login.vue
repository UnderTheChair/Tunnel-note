<template>
  <div class="home">
    <LoginFrom />
  </div>
</template>

<script>
// @ is an alias to /src
import LoginFrom from "@/components/LoginForm.vue";

export default {
  name: "home",
  components: {
    LoginFrom
  },
  mounted() {
    let preSignup = this.$store.getters.isPreSignup;

    if (preSignup == true) {
      this.noticeCompletedSignup();
      this.$store.commit('setPreSignup', false);
    } 
  },
  methods: {
    noticeCompletedSignup: function() {
      this.$bvToast.toast("Completed Sign Up", {
        title: `Notice`,
        solid: true
      });
    }
  }
};
</script>
