<template>
  <div class="loading">
    <loading :active.sync="isLoading" :can-cancel="true" :on-cancel="onCancel" :is-full-page="true"></loading>
  </div>
</template>

<script>
// Import component
import Loading from "vue-loading-overlay";
// Import stylesheet
import "vue-loading-overlay/dist/vue-loading.css";

export default {
  data() {
    return {
      fullPage: true
    };
  },
  methods: {
    onCancel: function() {
      console.log("User cancelled the loader.");
    }
  },
  components: {
    Loading
  },
  props: ["isLoading"]
};
</script>