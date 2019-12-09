<template>
  <div class="home">
    <a href v-if="isAuthenticated" @click.prevent="onClickLogout">Logout</a>
    <div class="container">
      <div class="row">
        <div class="col-sm-4">
          <div class="custom-file">
            <input
              type="file"
              id="pdfFile"
              class="custom-file-input"
              name="pdf"
              v-on:change="reqUploadPDF"
            />
            <label class="custom-file-label" for="customFile">Choose file</label>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-sm-4" style v-for="pdf in pdfList" v-bind:key="pdf.modification_time">
          <PDFItem
            v-bind:pdfName="pdf.name"
            v-bind:thumbnail="pdf.thumbnail"
            v-bind:pdfId="pdf.id"
            style="margin: 3% 0%;"
          />
        </div>
      </div>
    </div>
    <Loading v-bind:isLoading="isLoading"/>
  </div>
</template>

<script>
import PDFItem from "@/components/PDFItem";
import Loading from '@/components/Loading';


export default {
  name: "home",
  data() {
    return {
      baseURL: this.$store.getters.getBaseUrl,
      pdfList: [],
      isLoading: false,
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
      let { name, size , type} = files[0];

      if (!files.length) {
        return;
      }
      let formData = new FormData();

      for (let pdfFile of this.pdfList) {
        if (pdfFile.name === name) {
          this.noticeToastMsg("Exist the file duplicated with name. Please upload the other file.");
          event.target.value = "";
          return;
        }
      }
      
      formData.append("pdfFile", files[0]);
      formData.append("name", name);
      formData.append("size", size);
      
      if (type !== "application/pdf") {
        this.noticeToastMsg("File supplied is not a valid PDF");
        event.target.value = "";
        return;
      }
      
      this.isLoading = true;
      this.$http
        .post(reqURL, formData)
        .then(({ data }) => {
          if (data.data === "failed") {
            this.isLoading = false;
            this.noticeToastMsg(data.message);
          } else {
            this.pdfList = [data].concat(this.pdfList);
            event.target.value = "";
            this.isLoading = false;
          }
        })
        .catch(err => {
          console.log(err);
          return;
        });
    },
    reqGetPDFs() {
      const reqURL = `${this.baseURL}/pdfs`;
      
      this.isLoading = true;
      this.$http.get(reqURL).then(({data}) => {
        this.pdfList = data;
        this.isLoading = false;
      }).catch(() => {
        this.isLoading = false;
      })
    },
    onCancel() {
      console.log("User cancelled the loader.");
    },
    noticeToastMsg: function(msg) {
      this.$bvToast.toast(msg, {
        title: `Notice`,
        solid: true
      });
    }
  },
  components: {
    PDFItem,
    Loading
  }
};
</script>

<style scoped>
.row {
  margin: 3% 0%;
}
</style>