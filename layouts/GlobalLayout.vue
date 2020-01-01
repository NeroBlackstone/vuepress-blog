<template>
  <div id="global-layout">
    <BlogHeader/>
    <section class="section">
      <DefaultGlobalLayout/>
    </section>
    <blog-footer/>
  </div>
</template>

<script>
  import GlobalLayout from '@app/components/GlobalLayout.vue'
  import BlogHeader from './BlogHeader'
  import BlogFooter from "./BlogFooter";

  export default {
    components: {
      BlogFooter,
       DefaultGlobalLayout: GlobalLayout,
       BlogHeader:BlogHeader
       },
  }
</script>
