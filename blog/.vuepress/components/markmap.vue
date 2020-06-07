<template>
    <div>
        <hr>
            <svg id="markmap" style="width: 800px; height: 800px"></svg>
        <hr>
    </div>
</template>

<script>
    import {transform} from 'markmap-lib/dist/transform.common'
    import {markmap} from 'markmap-lib/dist/view.common'
    //import md from './note.mkd'

    export default {
        name: "markmap",
        props:['src'],
        data:function () {
            return{

            }
        },
        beforeCreate() {
            window.MathJax = {
                options: {
                    skipHtmlTags: {
                        '[-]': ['code', 'pre']
                    }
                }
            };
        },
        mounted() {
            markmap('#markmap', transform(require(`${this.src}`)), {
                processHtml: nodes => {
                    if (window.MathJax.typeset) MathJax.typeset(nodes);
                },
            })
        }
    }
</script>

<style scoped>

</style>