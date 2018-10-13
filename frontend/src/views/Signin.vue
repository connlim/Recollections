<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-5 mt-3">
        <form v-on:submit.prevent="login">
          <div class="form-group">
            <label for="exampleInputEmail1">Email address</label>
            <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email">
          </div>
          <div class="form-group">
            <label for="exampleInputPassword1">Password</label>
            <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password">
          </div>
          <button type="submit" class="btn btn-primary">Submit</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import axios from 'axios';

export default {
  name: 'Signin',
  components: {

  },
  methods: {
    login() {
      axios.post(`${process.env.VUE_APP_BACKEND_URL}/login`, {
        email: document.getElementById('exampleInputEmail1').value,
        password: document.getElementById('exampleInputPassword1').value,
      }).then((res) => {
        localStorage.setItem('token', res.data);
        this.$router.push('/');
      }).catch((err) => {
        console.log(err);
      });
    }
  },
}
</script>
