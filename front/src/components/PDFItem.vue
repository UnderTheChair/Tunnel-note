<template>
  <div class="PDFItem">
    <div class="card">
      <img v-bind:src="getThumbnail()" width="250" height="250" style="margin: auto;" />
      <h4>{{pdfName}}</h4>
    </div>
  </div>
</template>

<script>
export default {
  name: "PDFItem",
  computed: {},
  methods: {
    getThumbnail: function() {
      let srcValue = `data:image/png;base64,${this.thumbnail}`;
      return srcValue;
    }
  },
  props: ["pdfName", "thumbnail"]
};
</script>