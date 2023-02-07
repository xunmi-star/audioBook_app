import Vue from 'vue'
import App from './App.vue'
import store from './store'

import {router,RouterMount} from './router.ts'  //路径换成自己的
Vue.use(router)

import http from './utils/request.ts'
Vue.prototype.$httpRequest = http.http

import requestApi from './utils/requestApi.ts'
Vue.prototype.$httpApi = requestApi.api

import theme from './utils/theme.ts'
Vue.prototype.$changeColor = theme.changeColor
Vue.prototype.$changeBorderColor = theme.changeBorderColor

import storage from './utils/storage'
Vue.prototype.$Storage = storage

Vue.prototype.$ossUrl = process.env.VUE_APP_BASE_OSS

// 引入uView
import uView from "uview-ui"
Vue.use(uView);
(uni as any).$u.config.unit = 'rpx';//配置默认单位
(uni as any).$u.props.image.width = 'auto';//给u-image组件全局配置默认值
(uni as any).$u.props.image.height = 'auto';

import tool from './utils/tool.ts'
Vue.prototype.$tool = tool

//引入vuex状态管理
Vue.prototype.$store = store

Vue.config.productionTip = false

//v1.3.5起 H5端 你应该去除原有的app.$mount();使用路由自带的渲染方式
// #ifdef H5
RouterMount(new App({ store }),router,'#app')
// #endif

// #ifndef H5
new App({ store }).$mount(); //为了兼容小程序及app端必须这样写才有效果
// #endif