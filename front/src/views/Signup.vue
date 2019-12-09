<template>
  <div clss="signup">
    <div class="container">
      <div class="row">
        <div class="col-sm-6 col-md-offset-3" style="margin: 0 auto;">
          <SignupForm />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SignupForm from "@/components/SignupForm.vue";
export default {
  name: "signup",
  components: {
    SignupForm
  }
};
</script>