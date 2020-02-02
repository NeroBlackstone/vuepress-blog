<template>
    <footer class="footer">
            <div class="level">
                <div class="content level-item has-text-centered">
                    <b-field grouped group-multiline>
                        <div class="control">
                            <b-tag type="is-primary">
                                <a href="https://github.com/NeroBlackstone" class="has-text-white">
                                    <span class="icon">
                                        <i class="fab fa-github"/>
                                    </span>
                                </a>
                            </b-tag>
                        </div>
                        <div class="control">
                            <a href="https://v1.vuepress.vuejs.org/">
                            <b-taglist attached>
                                <b-tag type="is-dark">vuepress</b-tag>
                                <b-tag type="is-info">1.2.0</b-tag>
                            </b-taglist>
                            </a>
                        </div>
                        <div class="control">
                            <a href="https://buefy.org/">
                            <b-taglist attached>
                                <b-tag type="is-dark">buefy</b-tag>
                                <b-tag type="is-success">0.8.10</b-tag>
                            </b-taglist>
                            </a>
                        </div>
                    </b-field>
                </div>
            </div>
    </footer>
</template>

<script>
    export default {
        name: "BlogFooter"
    }
</script>

<style scoped>

</style>