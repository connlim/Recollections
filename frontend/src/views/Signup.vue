<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-5 mt-3">
        <form id="signup-form" v-on:submit.prevent="register">
          <div class="form-group">
            <label for="email">Email address</label>
            <input name="email" type="email" class="form-control" id="email" aria-describedby="emailHelp" placeholder="Email">
          </div>
          <div class="form-group">
            <label for="username">Username</label>
            <input name="username" type="username" class="form-control" id="username" aria-describedby="emailHelp" placeholder="Username">
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input name="password" type="password" class="form-control" id="password" placeholder="Password">
          </div>
          <div class="custom-file mt-2">
            <input name="profile_pic" type="file" accept=".jpg" class="custom-file-input" id="profilePicUpload" aria-describedby="inputGroupFileAddon01" multiple>
            <label class="custom-file-label" for="profilePicUpload">Choose profile picture</label>
          </div>
          <button type="submit" class="btn btn-primary mt-3">Register</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import axios from 'axios';

export default {
  name: 'Signup',
  components: {

  },
  methods: {
    register: function() {
      const form = document.getElementById('signup-form');
      const formData = new FormData(form);
      console.log('foo');
      axios({
        method: 'post',
        url: `${process.env.VUE_APP_BACKEND_URL}/signup`,
        data: formData,
        config: {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      }).then((res) => {
        console.log('success');
        console.log(res);
      }).catch((err) => {
        console.log('error');
        console.log(err);
      });
    }
  }
}
</script>
