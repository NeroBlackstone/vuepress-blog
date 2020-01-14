<template>
    <b-navbar type="is-primary" fixed-top>
      <template slot="brand">
        <b-navbar-item tag="router-link" to="/">
            {{ $site.title }}
        </b-navbar-item>
      </template>
        <template slot="end">
            <b-navbar-item tag="router-link" to="/tag/">Tag</b-navbar-item>
            <b-navbar-item tag="router-link" to="/friends/">Friends</b-navbar-item>
        </template>
    </b-navbar>

</template>
<script>
export default {
  name:"blogHeader",

}
</script>