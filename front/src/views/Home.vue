<template>
  <div class="home">
  </div>
</template>

<script>
export default {
  name: 'home',
  beforeCreate() {
    this.$router.push('/login');
  }
}
</script>