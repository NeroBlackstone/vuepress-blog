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
                        <div class="control" v-for="library in libraries">
                            <a :href="library.officialSite">
                            <b-taglist attached>
                                <b-tag type="is-dark">{{library.libraryName}}</b-tag>
                                <b-tag type="is-info">{{package.devDependencies[library.libraryName] ||
                                    package.dependencies[library.libraryName]}}</b-tag>
                            </b-taglist>
                            </a>
                        </div>
                    </b-field>
                </div>
            </div>
    </footer>
</template>

<script>
    import packageInfo from "../package.json"
    export default {
        name: "BlogFooter",
        data:function () {
            return {
                 libraries:[
                     {
                         libraryName:'vuepress',
                         officialSite:'https://v1.vuepress.vuejs.org/'
                     },
                     {
                         libraryName:'buefy',
                         officialSite:'https://buefy.org/'
                     }
                 ],
                package:packageInfo
            }
        }
    }
</script>

<style scoped>

</style>