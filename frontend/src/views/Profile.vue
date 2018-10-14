<template>
  <div class="container mt-3">
    <h2>Your Images</h2>
    <div class="gallery mt-3 mb-3" id="gallery">
      <!-- Grid column -->
      <div v-for="image in images" :key="image.id" class="mb-3">
        <img class="img-fluid" :src="getImageSource(image.id)" alt="Card image cap">
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Profile',
  components: {
    
  },
  methods: {
    getImageSource: function(imageID) {
      return `${process.env.VUE_APP_BACKEND_URL}/image/` + imageID;
    }
  },
  created() {
    let that = this;
    axios.get(`${process.env.VUE_APP_BACKEND_URL}/profile`, {
      headers: {
        Authorization:  `Bearer ${localStorage.getItem('token')}`
      }
    }).then((res) => {
      console.log(res.data);
      that.images = res.data;
    }).catch((err) => {
      console.log(err);
    });
  },
  data() {
    return {
      images: []
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

