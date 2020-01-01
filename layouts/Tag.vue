<template>
  <b-taglist>
    <b-tag type="is-info" v-for="tag in $tag.list">
      <router-link class="has-text-white" :to="tag.path">{{ tag.name }}</router-link>
    </b-tag>
  </b-taglist>
</template>