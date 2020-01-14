import Buefy from "buefy"
import 'buefy/dist/buefy.css'
import '@fortawesome/fontawesome-free/css/all.css'

import VueApollo from 'vue-apollo'
import {HttpLink} from 'apollo-link-http'
import {ApolloClient} from 'apollo-client'
import {InMemoryCache} from 'apollo-cache-inmemory'
import {ApolloLink} from "apollo-link";

const httpLink=new HttpLink({
    uri:'https://api.github.com/graphql'
});

const authMiddleware=new ApolloLink(((operation, forward) => {
    const token='693d5ce1886ade0568b15076738ac7ca7931ca71';
    operation.setContext({
        headers:{
            authorization:`Bearer ${token}`
        }
    });
    return forward(operation)
}));

const apolloClient=new ApolloClient({
    link:authMiddleware.concat(httpLink),
    cache:new InMemoryCache(),
    connectToDevTools:true
});

const apolloProvider=new VueApollo({
    defaultClient:apolloClient,
    defaultOptions:{
        $loadingKey:'loading'
    }
});

export default ({
    Vue, // VuePress 正在使用的 Vue 构造函数
    options
})=>{
    Vue.use(Buefy,{
        defaultIconPack: 'fas',
    });
    Vue.use(VueApollo);
    options={
        ...options,
        apolloProvider
    }
}