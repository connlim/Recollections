<template>
  <div class="container">
    <div id="nav" style="text-align: center">
      <router-link to="/">Feed</router-link> |
      <router-link to="/recollections">Recollections</router-link>
    </div>

    <div class="row justify-content-center mb-3">
      <div class="card col-lg-8">
        <div class="card-body">
          <h5 class="card-title mb-3">Event Name</h5>
          <h6 class="card-subtitle mb-2">
            <font-awesome-icon icon="map-marker-alt"></font-awesome-icon>
            Location
          </h6>
          <h6 class="card-subtitle mb-2">
            <font-awesome-icon icon="users"></font-awesome-icon>
            Person 1, Person 2, Person 3
          </h6>
          <div class="gallery mt-3" id="gallery">
            <!-- Grid column -->
            <div class="mb-3">
              <img class="img-fluid" src="../../../test.jpg" alt="Card image cap">
            </div>
            <div class="mb-3">
              <img class="img-fluid" src="../assets/logo.png" alt="Card image cap">
            </div>
            <div class="mb-3">
              <img class="img-fluid" src="https://mdbootstrap.com/img/Photos/Vertical/mountain2.jpg" alt="Card image cap">
            </div>
            <div class="mb-3">
              <img class="img-fluid" src="https://mdbootstrap.com/img/Photos/Horizontal/Nature/4-col/img%20(35).jpg" alt="Card image cap">
            </div>
            <div class="mb-3">
              <img class="img-fluid" src="https://mdbootstrap.com/img/Photos/Horizontal/Nature/4-col/img%20(18).jpg" alt="Card image cap">
            </div>
            <div class="mb-3">
              <img class="img-fluid" src="https://mdbootstrap.com/img/Photos/Vertical/mountain3.jpg" alt="Card image cap">
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
// @ is an alias to /src

export default {
  name: 'Feed',
  components: {
    
  },
  methods: {
    like: function() {

    }
  }
}
</script>

<style lang="scss">
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
