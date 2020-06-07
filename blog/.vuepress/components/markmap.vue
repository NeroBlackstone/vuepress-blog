<template>
    <svg id="markmap" style="width: 800px; height: 800px"></svg>
</template>

<script>
    import {transform} from 'markmap-lib/dist/transform.common'
    import {markmap} from 'markmap-lib/dist/view.common'

    export default {
        name: "markmap",
        data:function () {
            return{

            }
        },
        mounted() {
            const data = transform('./note.md');
            markmap('#markmap', data);
        }
    }
</script>

<style scoped>

</style>