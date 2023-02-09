<template>
  <view class="page" :class="[$changeColor('block-bcg')]" :style="$store.state.Seeting.initTheme">
   <view class="section-box">
      <view class="item" :class="[item.show?'action':'']" v-for="(item,index) in sectionList" :key="index" @click="select(index)">{{ item.name }}</view>
    </view>
    <view class="main-box">
      <!-- 追更 -->
      <Chase v-show="$store.state.MyListen.current===0 && cmpShow"></Chase>
      <!-- 订阅 -->
      <Subscribe v-show="$store.state.MyListen.current===1 && cmpShow"></Subscribe>
    </view>
    <!-- 返回顶部 -->
    <Wrap :cmpScrollTop="scrollTop"></Wrap>
  </view>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import { MyListenModule } from '@/store/modules/myListen'

import Wrap from '@/components/wrap.vue'
import Chase from './components/chase.vue'
import Subscribe from './components/subscribe.vue'

@Component({name: 'MyListen', components: { Wrap,Chase,Subscribe }})
export default class MyListen extends Vue {
  private cmpShow: boolean = true //是否进入我听页面
  private scrollTop: number =  0 //离顶部的距离
  private sectionList = [
        { name: '追更', show: true },
        { name: '订阅', show: false },
      ] as object[] | any

  onPageScroll(e: any) {
    this.scrollTop = e.scrollTop;
  }
  onShow(){
    // MyListenModule.setState({state: 'current', value: 0})
    this.cmpShow = true
  }

  onLoad(){
  }

  onHide() {
    this.cmpShow = false
  }

  select(index: number){
    this.sectionList.map((item: any)=>{
      item.show = false
    })
    this.sectionList[index].show = true

    MyListenModule.setState({state: 'current', value: index})
  }

}
</script>

<style lang="scss" scoped>
.page{
  overflow: hidden;
}
.section-box{
  position: fixed;
  width: 100%;
  top: var(--status-bar-height);;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: $space-norm;
  padding-top: 0;
  z-index: 99;
  .item{
    margin: 0 $space-block;
    font-size: 40rpx;
    font-weight: 600;
    padding-bottom: 10rpx;
    border-bottom: 3px solid transparent;  
  }
  .action{
    border-bottom: 5px solid $stress-font;  
  }
}

.main-box{
  position: relative;
  top: 0;
  left: 0;
  z-index: 1;
  padding-bottom: 180rpx;
}
</style>
