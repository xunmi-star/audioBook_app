// 解决 vue+ts通过Vue.prototype绑定的属性方法，能够调用到，但是编译报错的问题
import Vue from 'vue'
declare module 'vue/types/vue' {
    interface Vue {
      $httpRequest: any
      $httpApi: any
      $ossUrl: any
      $tool: any
      $changeColor: any
      $Storage: any
    }
  }