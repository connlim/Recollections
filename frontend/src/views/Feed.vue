<template>
  <div class="container">
    <div id="nav" style="text-align: center">
      <router-link to="/">Feed</router-link> |
      <router-link to="/recollections">Recollections</router-link>
    </div>

    <div v-for="item in feed" class="row justify-content-center mb-3">
      <div class="card col-lg-7">
        <div class="card-body">
          <div class="d-flex">
            <h5 class="card-title mb-3 mr-auto">{{ item.name }}</h5>
            <p>{{ item.date | epochToDate }}</p>
          </div>
          <h6 class="card-subtitle mb-2">
            <font-awesome-icon icon="map-marker-alt"></font-awesome-icon>
            {{ item.location }}
          </h6>
          <h6 class="card-subtitle mb-2">
            <font-awesome-icon icon="users"></font-awesome-icon>
            {{ item.other_users | expandArray }}
          </h6>
          <div class="gallery mt-3" id="gallery">
            <!-- Grid column -->
            <div v-for="imageID in item.images" class="mb-3">
              <img class="img-fluid" :src="getImageSource(imageID)" alt="Card image cap">
            </div>
          </div>
          <div class="row">
            <button type="button" class="btn btn-link">Like</button>
            <span style="line-height: 40px">|</span>
            <button type="button" class="btn btn-link">Comment</button>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script>
import axios from 'axios';
import moment from 'moment';

export default {
  name: 'Feed',
  components: {
    
  },
  methods: {
    getImageSource: function(imageID) {
      return `${process.env.VUE_APP_BACKEND_URL}/image/` + imageID;
    }
  },
  filters: {
    epochToDate: function(epoch) {
      return moment.unix(parseInt(epoch)).format("YYYY-MM-DD");
    },
    expandArray: function(arr) {
      return arr.join(', ');
    }
  },
  created() {
    let that = this;
    axios.get(`${process.env.VUE_APP_BACKEND_URL}/feed`, {
      headers: {
        Authorization:  `Bearer ${localStorage.getItem('token')}`
      }
    }).then((res) => {
      console.log(res.data);
      that.feed = res.data;
    }).catch((err) => {
      console.log(err);
    });


  },
  data() {
    return {
      feed: []
    }
  }
}
</script>

<style lang="scss">
.gallery {
  -webkit-column-count: 2;
  -moz-column-count: 2;
  column-count: 2;
  -webkit-column-width: 50%;
  -moz-column-width: 50%;
  column-width: 50%; 
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
