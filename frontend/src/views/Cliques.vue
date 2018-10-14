<template>
  <div class="container">
    <div id="nav" style="text-align: center">
      |
      <span v-for="clique in cliques" :key="clique.id">
        <a :class="{'small-nav-active': clique.id == activeClique.id}" @click="showData(clique)" href="#">{{ clique.name }}</a> | 
        <!-- :class="{'small-nav-active': clique.id == activeClique.id}" -->
      </span>
    </div>

    <div class="d-flex">
      <button type="button" class="ml-auto btn btn-primary" data-toggle="modal" data-target="#createCliqueDialog">Create Clique</button>
    </div>

    <div v-if="feed == null || feed.length == 0" class="d-flex justify-content-center" style="margin-top:50px;">
		  <h5><b>No memories in this Clique</b></h5>
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

    <div class="modal fade" id="createCliqueDialog" tabindex="-1" role="dialog" aria-labelledby="createCliqueDialog" aria-hidden="true">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Create new Clique</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="">Clique Name</label>
              <div class="input-group">
                <input v-model="newClique.clique_name" type="text" class="form-control" placeholder="Enter clique name">
              </div>
            </div>
            <div class="form-group">
              <label for="">Users in the clique</label>
              <div class="input-group">
                <input v-model="newClique.users" type="text" class="form-control" placeholder="Enter user emails separated by commas (abc@a.com,abc@b.com)">
              </div>
            </div>			
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-danger" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-success" data-dismiss="modal" @click="createNewClique()">Confirm</button>
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
  name: 'Cliques',
  components: { 
  },
  methods: {
    fetchData: function() {
      let that = this;
      
      axios.get(`${process.env.VUE_APP_BACKEND_URL}/clique`, {
        headers: {
          Authorization:  `Bearer ${localStorage.getItem('token')}`
        }
      }).then((res) => {
        console.log(res.data);
        that.cliques = res.data;
        that.showData(res.data[0]);
      }).catch((err) => {
        console.log(err);
      });
    },
    showData: function(clique) {
      let that = this;
      this.activeClique = clique;
      let clique_id = clique.id;

      axios.get(`${process.env.VUE_APP_BACKEND_URL}/clique/${clique_id}`, {
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
    createNewClique: function() {
      let users = this.newClique.users.split(',');

      axios.post(`${process.env.VUE_APP_BACKEND_URL}/clique`, {
        clique_name: this.newClique.clique_name,
        users: users
      }, 
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).then((res) => {
        console.log(res);
      }).catch((err) => {
        console.log(err);
      });
    },
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
    this.fetchData();
  },
  data() {
    return {
      cliques: [],
      activeClique: {
        id: null,
        name: null
      },
      feed: [],
      newClique: {
        clique_name: null,
        users: null
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.small-nav-active {
  text-decoration: underline;
}

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

