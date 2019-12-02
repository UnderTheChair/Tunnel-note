<template>
  <div class="PDFItem">
    <div class="card" v-on:click="movePDF()">
      <img v-bind:src="getThumbnail()" width="250" height="250" style="margin: auto;" />
      <h4>{{pdfName}}</h4>
    </div>
  </div>
</template>

<script>
export default {
  name: "PDFItem",
  data() {
    return{
      baseURL: this.$store.getters.getBaseUrl,
    }
  },
  computed: {},
  methods: {
    getThumbnail: function() {
      let srcValue = `data:image/png;base64,${this.thumbnail}`;
      return srcValue;
    },
    movePDF: function() {
      
      this.$http.post(`${this.baseURL}/pdfs/blob`, {
        pdfId: this.pidId,
        pdfName: this.pdfName
      }, {
        responseType: "blob"
        //Force to receive data in a Blob Format
      })
      .then(response => {
        //Create a Blob from the PDF Stream
        const blob = new Blob([response.data], {
          type: "application/pdf"
        });
        
        const fileURL = URL.createObjectURL(blob)
        localStorage.setItem('fileURL', fileURL)
        localStorage.setItem('pdfName', this.pdfName)
        window.open("http://13.125.136.140/web/")

      })
      .catch(error => {
        console.log(error);
      });
      //localStorage.setItem("pdf-file",  )
    }
  },
  props: ["pdfName", "thumbnail", "pddId"]
};
</script>