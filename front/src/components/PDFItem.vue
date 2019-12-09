<template>
  <div class="PDFItem">
    <div class="card">
      <b-dropdown id="dropdown-header" text="SET" >
        <b-dropdown-item-button aria-describedby="dropdown-header-label" v-on:click="renamePDF">Rename</b-dropdown-item-button>
        <b-dropdown-item-button aria-describedby="dropdown-header-label" v-on:click="removePDF">Remove</b-dropdown-item-button>
      </b-dropdown>
      <img
        v-bind:src="getThumbnail()"
        style="margin: auto;   max-width: 100%;"
        v-on:click="movePDF()"
      />

      <h4>{{name}}</h4>
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
      name: this.pdfName,
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
            pdfName: this.name
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
          localStorage.setItem("pdfName", this.name);
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
      let isRemove = confirm("Do you really want to remove it?");

      if (isRemove) {
        this.isLoading = true;
        this.$http
          .post(`${this.baseURL}/pdfs/remove`, {
            pdfId: this.pdfId,
            pdfName: this.name
          })
          .then(() => {
            window.location.reload();
          })
          .catch(err => {
            this.isLoading = false;
            console.log(err);
          });
      }
    },
    renamePDF: function() {
      let newName = window.prompt("Enter new PDF name");

      if(newName) {
        this.isLoading = true;
        this.$http
          .post(`${this.baseURL}/pdfs/rename`, {
            pdfId: this.pdfId,
            pdfName: this.name,
            pdfNewName: newName
          })
          .then(({data}) => {
            this.noticeToastMsg('Success renaming PDF');
            console.log(data);
            this.name = data.name;
            this.isLoading = false;
          })
          .catch(err => {
            this.isLoading = false;
            console.log(err);
          });
      }
    },
    noticeToastMsg: function(msg) {
      this.$bvToast.toast(msg, {
        title: `Notice`,
        solid: true
      });
    }
  },
  props: ["pdfName", "thumbnail", "pdfId"]
};
</script>
<style scoped>
.pdf-set {
  text-align: right;
}
</style>