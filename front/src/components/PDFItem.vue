<template>
  <div class="PDFItem">
    <div class="card" v-on:click="movePDF()">
      <img v-bind:src="getThumbnail()" width="250" height="250" style="margin: auto;" />
      <h4>{{pdfName}}</h4>
    </div>
    <loading :active.sync="isLoading" 
        :can-cancel="true" 
        :on-cancel="onCancel"
        :is-full-page="fullPage"/>
  </div>
</template>

<script>
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

export default {
  name: "PDFItem",
  data() {
    return{
      baseURL: this.$store.getters.getBaseUrl,
      isLoading: false,
      fullPage: true,
    }
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
        this.isLoading = false
      })
      .catch(error => {
        console.log(error);
        this.isLoading = false
      });
      //localStorage.setItem("pdf-file",  )
    },
    onCancel() {
      console.log('User cancelled the loader.')
    }
  },
  props: ["pdfName", "thumbnail", "pddId"]
};
</script>