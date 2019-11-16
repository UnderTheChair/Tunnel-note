<template>
    <div class="pdflist">
    <input :accept=fileTypes type="file" hidden :multiple="allowMultiple" @change="readFile" ref="fileInput" />
    <div class="upload-icon" @click="$refs.fileInput.click()">
        <div class="upload-items" v-if="!selectedFileName && fileFlag" >
            <span>{{ $t('File_ReUpload_Button') }}</span>
        </div>
        <div class="upload-items" v-else-if="!selectedFileName && !fileFlag">
            <span>{{ $t('File_Upload_Button') }}</span>
        </div>
        <div class="upload-items" v-else-if="selectedFileName">
            <span>{{ selectedFileName }}</span>
        </div>
    </div>
    </div>
</template>

<script>
  export default {
    data () {
      return {
        multipleFiles: [],
        selectedFileName: null
      }
    },
    name: 'file-upload',
    methods: {
      readFile: function (e) {
        const files = e.target.files
        const totalFiles = files.length
        for (let index = 0; index < totalFiles; index += 1) {
          const file = files[index]
          let reader = new FileReader()
          reader.readAsDataURL(file)
          reader.addEventListener('load', () => {
            const result = Object.assign(file, { fileUpload: reader.result })
            this.multipleFiles.push(result)
            if (totalFiles === this.multipleFiles.length) {
              this.$emit(
                'file-upload',
                this.allowMultiple ? this.multipleFiles : this.multipleFiles[0]
              )
              this.multipleFiles = []
            }
            reader = null
          })
        }
        this.selectedFileName = files[0]['name']
      }
    },
    props: {
      fileFlag: {
        type: String
      },
      allowMultiple: {
        type: Boolean,
        default: false
      },
      fileTypes: {
        type: String,
        default: '.p12,.pem,application/x-pkcs12'
      }
    }
  }
</script>
<style scoped>
    .upload-icon {
        width: 220px;
        height: 40px;
        border: 1px solid #ccc;
        background-color: #fff;
        overflow: hidden;
        border-radius: 2px;
        text-align: center;
    }
    .upload-icon:hover {
        cursor: pointer;
    }
    .upload-icon .upload-items {
        display: flex;
        flex-direction: row;
        color: #989a9c;
        padding: 0 5px;
    }
    .upload-icon img {
        width: 32px;
        height: 32px;
        margin: auto 0;
    }
    .upload-icon span {
        margin: auto 0;
        padding-left: 4px;
    }
    .upload-items span{
      margin: auto auto; padding: 0
    }
</style>