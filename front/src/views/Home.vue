<template>
  <div class="home">
    <a href v-if="isAuthenticated" @click.prevent="onClickLogout">Logout</a>
  </div>
</template>

<script>
export default {
  name: "home",
  computed: {
    isAuthenticated() {
      return this.$store.getters.isAuthenticated;
    }
  },
  methods: {
    onClickLogout() {
      // LOGOUT 변이 실행 후 리다이렉트
      this.$store.dispatch("LOGOUT").then(() => this.$router.push("/login"));
    }
  }
};
</script>