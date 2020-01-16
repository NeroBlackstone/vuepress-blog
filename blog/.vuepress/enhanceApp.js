import Buefy from "buefy"
import 'buefy/dist/buefy.css'
import '@fortawesome/fontawesome-free/css/all.css'

export default ({
    Vue, // VuePress 正在使用的 Vue 构造函数
    options
})=>{
    Vue.use(Buefy,{
        defaultIconPack: 'fas',
    });
}