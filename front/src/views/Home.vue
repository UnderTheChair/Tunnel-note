<template>
  <div class="home">
    <a href v-if="isAuthenticated" @click.prevent="onClickLogout">Logout</a>
    <div class="container">
      <div class="row">
        <div class="col-sm-4" style>
          <input
            type="file"
            id="pdfFile"
            class="btn btn-primary btn-block"
            name="pdf"
            v-on:change="reqUploadPDF"
          />
        </div>
      </div>

      <div class="row">
        <div class="col-sm-4" style v-for="pdf in pdfList" v-bind:key="pdf.modification_time">
          <PDFItem 
          v-bind:pdfName="pdf.name" 
          v-bind:thumbnail="pdf.thumbnail" 
          style="margin: 3% 0%;"
          
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PDFItem from "@/components/PDFItem";

export default {
  name: "home",
  data() {
    return {
      baseURL: this.$store.getters.getBaseUrl,
      pdfList: [],
    };
  },
  computed: {
    isAuthenticated() {
      return this.$store.getters.isAuthenticated;
    }
  },
  mounted() {
    this.reqGetPDFs();
  },
  methods: {
    onClickLogout() {
      // LOGOUT 변이 실행 후 리다이렉트
      this.$store.dispatch("LOGOUT").then(() => this.$router.push("/login"));
    },
    reqUploadPDF(event) {
      const reqURL = `${this.baseURL}/pdfs/upload`;
      let files = event.target.files || event.dataTransfer.files;
      let { name, size } = files[0];

      if (!files.length) {
        return;
      }
      let formData = new FormData();

      formData.append("pdfFile", files[0]);
      formData.append("name", name);
      formData.append("size", size);
      this.$http.post(reqURL, formData).then(({data}) => {
        this.pdfList = [data].concat(this.pdfList);
        event.target.value = "";
      });
    },
    reqGetPDFs() {
      const reqURL = `${this.baseURL}/pdfs`;
      
      this.$http.get(reqURL).then(({data}) => {
        this.pdfList = data;
      })
    }
  },
  components: {
    PDFItem
  }
};
</script>

<style scoped>
.row {
  margin: 3% 0%;
}
</style>