module.exports = {
  title: "NeroBlackstone's Blog",
  theme: require.resolve('../../'),
  themeConfig:{
    modifyBlogPluginOptions (blogPluginOptions) {
      const sitemap = {
        hostname: 'https://NeroBlackstone.github.io'
      }

      const comment = {
        //service: 'disqus',
        shortname: 'vuepress-plugin-blog',
        service: 'vssue',
        // owner: 'You',
        // repo: 'Your repo',
        // clientId: 'Your clientId',
        // clientSecret: 'Your clientSecret',
      }

      return { ...blogPluginOptions, sitemap, comment, }
    }
  }
};
