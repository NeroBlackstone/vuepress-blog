<template>
  <div class="container">
    <Content/>
    <Comment/>
  </div>
</template>
<script>
  import { Comment } from '@vuepress/plugin-blog/lib/client/components'
  export default {
    components:{
      Comment
    }
  }
</script>
<style lang="stylus">
  p,ul,ol
    margin-top 1rem
    margin-bottom 1rem

  .number 
    align-items normal
    background-color rgba(0, 0, 0, 0)
    border-radius 0
    display inline
    font-size 16px
    height auto
    justify-content normal 
    margin-right 0
    min-width 0
    padding 0
    text-align left 
    vertical-align baseline

  ul
    list-style-type disc

  html, body
    padding 0
    margin 0
    background-color #fff

  body
    font-family BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", "Helvetica", "Arial",PingFang SC,Hiragino Sans GB,Microsoft YaHei,SimSun, sans-serif;
    -webkit-font-smoothing antialiased
    -moz-osx-font-smoothing grayscale


  .page
    padding-left $sidebarWidth

  .navbar
    position fixed
    z-index 20
    top 0
    left 0
    right 0
    height $navbarHeight
    background-color #fff
    box-sizing border-box
    border-bottom 1px solid $borderColor

  .sidebar-mask
    position fixed
    z-index 9
    top 0
    left 0
    width 100vw
    height 100vh
    display none

  .sidebar
    font-size 16px
    background-color #fff
    width $sidebarWidth
    position fixed
    z-index 10
    margin 0
    top $navbarHeight
    left 0
    bottom 0
    box-sizing border-box
    border-right 1px solid $borderColor
    overflow-y auto

  {$contentClass}:not(.custom)
    > *:first-child
      margin-top $navbarHeight

    a:hover
      text-decoration underline

    p.demo
      padding 1rem 1.5rem
      border 1px solid #ddd
      border-radius 4px

    img
      max-width 100%

  {$contentClass}.custom
    padding 0
    margin 0

    img
      max-width 100%

  p a code
    font-weight 400
    color $accentColor

  kbd
    background #eee
    border solid 0.15rem #ddd
    border-bottom solid 0.25rem #ddd
    border-radius 0.15rem
    padding 0 0.15em

  blockquote
    font-size .9rem
    color darken($accentColor, 50%)
    border-left: 3px solid $accentColor;
    margin 0.5rem 0
    padding .25rem 0 .25rem 1rem

    & > p
      margin 0

  ul, ol
    padding-left 1.2em

  strong
    font-weight 600

  h1, h2, h3, h4, h5, h6
    font-weight 600
    line-height 1.25
    font-family PT Serif

    {$contentClass}:not(.custom) > &
      margin-top (0.5rem - $navbarHeight)
      padding-top ($navbarHeight + 1rem)
      margin-bottom 0

      &:first-child
        margin-top -4rem
        margin-bottom 1rem

        + p, + pre, + .custom-block
          margin-top 2rem

    &:hover .header-anchor
      opacity: 1

  h1
    font-size 2.2rem

  h2
    font-size 1.65rem
    padding-bottom .3rem
    border-bottom 1px solid $borderColor

  h3
    font-size 1.35rem

  a.header-anchor
    font-size 0.85em
    float left
    margin-left -0.87em
    padding-right 0.23em
    margin-top 0.125em
    opacity 0

    &:hover
      text-decoration none

  code, kbd, .line-number
    font-family source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace

  p, ul, ol
    line-height 1.7

  hr
    border 0
    border-top 1px solid $borderColor

  table
    border-collapse collapse
    margin 1rem 0
    display: block
    overflow-x: auto

  tr
    border-top 1px solid #dfe2e5

    &:nth-child(2n)
      background-color #f6f8fa

  th, td
    border 1px solid #dfe2e5
    padding .6em 1em

  .theme-container
    &.sidebar-open
      .sidebar-mask
        display: block

    &.no-navbar
      {$contentClass}:not(.custom) > h1, h2, h3, h4, h5, h6
        margin-top 1.5rem
        padding-top 0

      .sidebar
        top 0
  {$contentClass}
  code
    color lighten($textColor, 20%)
    padding 0.1rem 0.4rem
    margin 0.1rem
    font-size 0.85em
    background-color rgba(27,31,35,0.05)
    border-radius 15px
    .token
      &.deleted
        color #EC5975
      &.inserted
        color $accentColor

  {$contentClass}
    pre, pre[class*="language-"]
      line-height 1.4
      padding 1.25rem 1.5rem
      margin 0.85rem 0
      background-color $codeBgColor
      border-radius 6px
      overflow auto
      code
        color #fff
        padding 0
        background-color transparent
        border-radius 0

  div[class*="language-"]
    position relative
    background-color $codeBgColor
    border-radius 6px
    .highlight-lines
      user-select none
      padding-top 1.3rem
      position absolute
      top 0
      left 0
      width 100%
      line-height 1.4
      .highlighted
        background-color rgba(0, 0, 0, 66%)
    pre, pre[class*="language-"]
      background transparent
      position relative
      z-index 1
    &::before
      position absolute
      z-index 3
      top 0.8em
      right 1em
      font-size 0.75rem
      color rgba(255, 255, 255, 0.4)
    &:not(.line-numbers-mode)
      .line-numbers-wrapper
        display none
    &.line-numbers-mode
      .highlight-lines .highlighted
        position relative
        &:before
          content ' '
          position absolute
          z-index 3
          left 0
          top 0
          display block
          width $lineNumbersWrapperWidth
          height 100%
          background-color rgba(0, 0, 0, 66%)
      pre
        padding-left $lineNumbersWrapperWidth + 1 rem
        vertical-align middle
      .line-numbers-wrapper
        position absolute
        top 0
        width $lineNumbersWrapperWidth
        text-align center
        color rgba(255, 255, 255, 0.3)
        padding 1.25rem 0
        line-height 1.4
        br
          user-select none
        .line-number
          position relative
          z-index 4
          user-select none
          font-size 0.85em
      &::after
        content ''
        position absolute
        z-index 2
        top 0
        left 0
        width $lineNumbersWrapperWidth
        height 100%
        border-radius 6px 0 0 6px
        border-right 1px solid rgba(0, 0, 0, 66%)
        background-color $codeBgColor


  for lang in $codeLang
    div{'[class~="language-' + lang + '"]'}
      &:before
        content ('' + lang)

  div[class~="language-javascript"]
    &:before
      content "js"

  div[class~="language-typescript"]
    &:before
      content "ts"

  div[class~="language-markup"]
    &:before
      content "html"

  div[class~="language-markdown"]
    &:before
      content "md"

  div[class~="language-json"]:before
    content "json"

  div[class~="language-ruby"]:before
    content "rb"

  div[class~="language-python"]:before
    content "py"

  div[class~="language-bash"]:before
    content "sh"

  div[class~="language-php"]:before
    content "php"

  .custom-block
  .custom-block-title
    font-weight 600
    margin-bottom -0.4rem
  &.tip, &.warning, &.danger
    padding .1rem 1.5rem
    border-left-width .5rem
    border-left-style solid
    margin 1rem 0
  &.tip
    background-color #f3f5f7
    border-color #42b983
  &.warning
    background-color rgba(255,229,100,.3)
    border-color darken(#ffe564, 35%)
    color darken(#ffe564, 70%)
    .custom-block-title
      color darken(#ffe564, 50%)
    a
      color $textColor
  &.danger
    background-color #ffe6e6
    border-color darken(red, 20%)
    color darken(red, 70%)
    .custom-block-title
      color darken(red, 40%)
    a
      color $textColor


</style>
<style src="prismjs/themes/prism-dark.css"></style>