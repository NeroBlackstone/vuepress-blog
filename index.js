module.exports = {
  plugins: [
    ['@vuepress/blog', {
      directories: [
        {
          id: 'post',
          dirname: '_posts',
          path: '/',
          pagination: {
            lengthPerPage: 5,
          },
        },
      ],
      frontmatters: [
        {
          id: "tag",
          keys: ['tag', 'tags'],
          path: '/tag/',
          layout: 'Tag',
          frontmatter: { title: 'Tag' },
          itemlayout: 'Tag',
          pagination: {
            perPagePosts: 3
          }
        },
        {
          id: "friends",
          keys: ['friends'],
          path: '/friends/',
          layout: 'Friends',
          frontmatter: { title: 'Friends' },
          itemlayout: 'Friends',
          pagination: {
            perPagePosts: 3
          }
        }
      ]
    }],
  ],
};
