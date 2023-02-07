import Vue from 'vue';
import Vuex from 'vuex';
// vuex持久化
import VuexPersistence from 'vuex-persist'
Vue.use(Vuex);

//允许devtools工具进行监测
Vue.config.devtools = true

export interface State {}

// vuex持久化需用到
let arr: any = []
// #ifdef H5
const vuexLocal = new VuexPersistence({
  storage: window.localStorage
})
arr.push(vuexLocal.plugin)
// #endif

export default new Vuex.Store({
  plugins: arr
});




// 标签中使用
// <text>{{ $store.state.Play.current_time }}</text> 
/**
 * 一：方法的使用  
 * 1.js中使用  import { PlayModule } from '@/store/modules/play'  
 * PlayModule.playOrPause() 
 * 
 * 2.常规.vue文件中的使用
 * 调用Mutation
 * this.$store.commit('User/setState',{state: 'test',value: '持久化测试信息'})
 * 调用Actation
 * this.$store.dispatch('User/resetToken',res.token)
 */
