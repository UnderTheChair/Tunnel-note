<template>
  <div class="PDFItem">
    <div class="card">
      <h4>{{pdfName}}</h4>
    </div>
  </div>
</template>

<script>
export default {
  name: "PDFItem",
  methods: {
    uploadPDF: function() {
      
    }
  },
  props: ['pdfName']
};
</script>