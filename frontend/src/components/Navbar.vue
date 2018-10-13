<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
        <router-link to="/" class="navbar-brand clickable">Recollections</router-link>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup"
            aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <div class="navbar-nav mr-auto">
                <!-- <router-link to="/" class="nav-item nav-link clickable">Feed</router-link>
                <router-link to="/recollections" class="nav-item nav-link clickable">Recollections</router-link> -->
            </div>
            <div class="navbar-nav">
                <router-link to="/cliques" class="nav-item nav-link clickable">Cliques</router-link>
                <router-link to="/profile" class="nav-item nav-link clickable">Profile</router-link>
                <router-link to="/new" class="nav-item nav-link clickable">New</router-link>
                <button type="button" class="ml-3 btn btn-default btn-sm" onclick="signout()">
                    Sign out
                </button>
            </div>
        </div>
    </nav>
</template>

<script>
export default {
    name: "Navbar",
    methods:
    {
		signout: function(){
			console.log('signout');
        }
    }
}
</script>

<style>

</style>
