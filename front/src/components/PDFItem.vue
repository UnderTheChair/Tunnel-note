<template>
  <div class="PDFItem">
    <div class="card">
      <button type="button" class="btn btn-light" v-on:click="removePDF">
        <icon name="trash" />
      </button>
      <img
        v-bind:src="getThumbnail()"
        width="250"
        height="250"
        style="margin: auto;"
        v-on:click="movePDF()"
      />

      <h4>{{pdfName}}</h4>
    </div>
    <loading v-bind:isLoading="isLoading" />
  </div>
</template>

<script>
import Loading from "@/components/Loading";

export default {
  name: "PDFItem",
  data() {
    return {
      baseURL: this.$store.getters.getBaseUrl,
      isLoading: false
    };
  },
  components: {
    Loading
  },
  methods: {
    getThumbnail: function() {
      let srcValue = `data:image/png;base64,${this.thumbnail}`;
      return srcValue;
    },
    movePDF: function() {
      this.isLoading = true;
      this.$http
        .post(
          `${this.baseURL}/pdfs/blob`,
          {
            pdfId: this.pidId,
            pdfName: this.pdfName
          },
          {
            responseType: "blob"
            //Force to receive data in a Blob Format
          }
        )
        .then(response => {
          //Create a Blob from the PDF Stream
          const blob = new Blob([response.data], {
            type: "application/pdf"
          });

          const fileURL = URL.createObjectURL(blob);
          localStorage.setItem("fileURL", fileURL);
          localStorage.setItem("pdfName", this.pdfName);
          window.open("http://13.125.136.140/web/");
          this.isLoading = false;
        })
        .catch(error => {
          console.log(error);
          this.isLoading = false;
        });
      //localStorage.setItem("pdf-file",  )
    },
    removePDF: function() {
      let isRemove = confirm('Do you really want to remove it?');
      
      if (isRemove) {
        this.isLoading = true;
        this.$http.post(
          `${this.baseURL}/pdfs/remove`,{
            pdfId: this.pdfId,
            pdfName: this.pdfName
          })
          .then(() => {
            window.location.reload()
          })
          .catch((err) => {
            this.isLoading = false;
            console.log(err);
          })
      }
    }
  },
  props: ["pdfName", "thumbnail", "pdfId"]
};
</script>
<style scoped>
</style>