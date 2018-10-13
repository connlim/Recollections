<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-7 mt-3 mb-3">
        <h2 class="mb-3">Upload Images</h2>
        <form id="upload-form" @submit.prevent="upload">
          <div>
            <input name="file" @change="handleFileChange" type="file" accept=".jpg" class="form-control-file" id="exampleFormControlFile1" multiple>
          </div>
          <div class="gallery mt-3" id="gallery">
            <!-- Grid column -->
            <div v-for="url in imageURLS" :key="url" class="mb-3">
              <img class="img-fluid" :src="url" alt="Image thumbnail">
            </div>
          </div>
          <button type="submit" class="btn btn-primary mt-3">Upload</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'New',
  components: {
    
  },
  methods: {
    handleFileChange: function(e) {
      console.log(e.target.files);
      console.log(URL.createObjectURL(e.target.files[0]));
      this.imageURLS = [...e.target.files].map(x => URL.createObjectURL(x));
    },
    upload: function() {
      const form = document.getElementById('upload-form');
      const formData = new FormData(form);
      console.log(formData);
      fetch(`${process.env.VUE_APP_BACKEND_URL}/images`, {
        method: 'POST',
        mode: 'cors',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then((res) => {
        console.log(res);
      }).catch((err) => {
        console.log(err);
      });
      // axios({
      //   method: 'post',
      //   url: `${process.env.VUE_APP_BACKEND_URL}/images`,
      //   data: formData,
      //   config: {
      //     headers: { 
      //       'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //       'Content-Type': 'multipart/form-data'
      //     },
      //   },
      // }).then((res) => {
      //   console.log(res);
      // }).catch((err) => {
      //   console.log(err);
      // });
    }
  },
  data() {
    return {
      imageURLS: []
    }
  }
}
</script>

<style lang="scss" scoped>
.gallery {
  -webkit-column-count: 3;
  -moz-column-count: 3;
  column-count: 3;
  -webkit-column-width: 33%;
  -moz-column-width: 33%;
  column-width: 33%; 
}

@media (max-width: 450px) {
  .gallery {
    -webkit-column-count: 1;
    -moz-column-count: 1;
    column-count: 1;
    -webkit-column-width: 100%;
    -moz-column-width: 100%;
    column-width: 100%;
  }
}

@media (max-width: 400px) {
  .btn.filter {
    padding-left: 1.1rem;
    padding-right: 1.1rem;
  }
}
</style>