<template>
    <div>{{user}}</div>
   <!-- <ApolloQuery :query="queryUser" :variables="{userId}" #default="{result:{loading,error,data}}">
        &lt;!&ndash;<div class="card" v-if="data.loading">
            <div class="card-image">
                <figure class="image is-1by1">
                    <img src="https://avatars1.githubusercontent.com/u/6657074?v=4" alt="Placeholder image">
                </figure>
            </div>
            <div class="card-content">
                <div class="content">
                    <p class="title is-4">{{userId}}</p>
                    {{data.bio}}
                </div>
            </div>
        </div>&ndash;&gt;
    </ApolloQuery>-->
</template>

<script>
    import gql from 'graphql-tag'
    //import USER_INFO from "./graphql/query/UserInfo.gql"
    export default {
        name: "FriendCard",
        //props:['userId'],
        data(){
            return{
                //hello:'1',
                //userId:'NeroBlackstone',
                //queryUser:USER_INFO
            }
        },
        apollo:{
            user:gql`
query {
  user(login:"NeroBlackstone"){
    bio
  }
}
            `
        }
    }
</script>

<style scoped>

</style>