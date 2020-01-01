<template>
  <div>
    <ul id="default-layout">
      <section class="section" v-for="page in $pagination.pages">
          <div class="container">
              <h1 class="title">
                <router-link :to="page.path">
                  {{ page.title }}
                </router-link>
              </h1>
              <h2 class="subtitle">
                {{ page.frontmatter.summary}}
              </h2>
              <div v-if="page.frontmatter.author">
                <span class="icon">
                  <i class="fas fa-home"></i>
                </span>
                <span>{{ page.frontmatter.author }} in {{ page.frontmatter.location }}</span>
              </div>
            <div v-if="page.frontmatter.date">
              <span class="icon">
                  <i class="fas fa-clock"></i>
                </span>
              <span>{{ resovlePostDate(page.frontmatter.date) }}</span>
            </div>
          </div>
      </section>
    </ul>
      <div class="has-text-centered">
          <Pagination/>
      </div>
  </div>
</template>
<script>
    import { Pagination } from '@vuepress/plugin-blog/lib/client/components'
  export default {
        components:{
            Pagination
        }
        ,
    methods:{
      resovlePostDate(date) {
        return new Date(date.replace(/-/g, '/').trim()).toDateString()
      },
    }
  }
</script>
