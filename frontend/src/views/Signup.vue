<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-5 mt-3">
        <form>
          <div class="form-group">
            <label for="email">Email address</label>
            <input type="email" class="form-control" id="email" aria-describedby="emailHelp" placeholder="Email">
          </div>
          <div class="form-group">
            <label for="username">Username</label>
            <input type="username" class="form-control" id="username" aria-describedby="emailHelp" placeholder="Username">
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" class="form-control" id="password" placeholder="Password">
          </div>
          <div class="custom-file mt-2">
            <input type="file" accept=".jpg" class="custom-file-input" id="profilePicUpload" aria-describedby="inputGroupFileAddon01">
            <label class="custom-file-label" for="profilePicUpload">Choose profile picture</label>
          </div>
          <button type="submit" class="btn btn-primary mt-3" @click="register()">Register</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'Signup',
  components: {
    
  },
  methods: {
    register: function() {

    }
  }
}
</script>
