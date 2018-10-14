<template>
  <div class="container">
    <div id="nav" style="text-align: center">
      |
      <span v-for="clique in cliques" :key="clique">
        <a :class="{'small-nav-active': clique == activeClique}" @click="showData(clique)" href="#">{{ clique }}</a> | 
      </span>
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
// @ is an alias to /src

export default {
  name: 'Cliques',
  components: { 
  },
  methods: {
    showData: function(clique) {
      this.activeClique = clique;
    }
  },
  created() {
    this.activeClique = this.cliques[0];
  },
  data() {
    return {
      cliques: ['Clique 1', 'Clique 2', 'Clique 3'],
      activeClique: null,
      feed: []
    }
  }
}
</script>

<style lang="scss" scoped>
.small-nav-active {
  text-decoration: underline;
}
</style>

