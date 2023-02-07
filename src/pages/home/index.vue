<template>
  <view class="page" :class="[$changeColor('block-bcg')]" :style="$store.state.Seeting.initTheme">
   <view class="content">
     <view class="nav-box" v-if="false">
       <view :class="[nav_active?'active':'']" @click="nav_active=true">推荐</view>
       <view :class="[nav_active?'':'active']" @click="nav_active=false">VIP</view>
     </view>
     <Recommend v-show="nav_active && cmpShow" :cmpData="loadMore"></Recommend>
     <Vip v-show="!nav_active  && cmpShow" :cmpData="loadMore"></Vip>
     <Wrap :cmpScrollTop="scrollTop"></Wrap>
   </view>
  </view>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import Recommend from './components/recommend.vue'
import Vip from './components/vip.vue'
import Wrap from '@/components/wrap.vue'

@Component({ name: 'Home', components: { Recommend, Vip, Wrap}})
export default class Index extends Vue {
  private theme: object = {} //配置主题
  private scrollTop: number = 0
  private num: number = 10
  private nav_active: boolean = true
  private cmpShow: boolean = true
  private loadMore:boolean = false
  private search = {
    clearabled: true as boolean, //是否开启清除控件
    keyword: '' as string,
    action: false,//是否开启右边控件
  }

  //滚动距离
  onPageScroll(e: any) {
		this.scrollTop = e.scrollTop;
	}

  onShow(){
		this.cmpShow = true

    // console.log('专辑详情：',this.$store.state.Play.albumInfo)
    // console.log('音频详情：',this.$store.state.Play.audioInfo)
    // console.log('缓存下载的专辑：',uni.getStorageSync(this.$Storage.keysObj.cacheAlbumList))
    // console.log('缓存下载的音频：',uni.getStorageSync(this.$Storage.keysObj.cacheAudioList))
  }

  onHide(){
    this.cmpShow = false
  }

  //计算属性
  get age(): Number {
    return this.num
  }
}
</script>

<style lang="scss" scoped>
.page{
  overflow: hidden;
  padding-bottom: 180rpx;
}
.nav-box{
  display: flex;
  align-content: center;
  padding: 10rpx;
  height: 90rpx;
  font-size: 40rpx;
  border-radius: $uni-radius-box;
  view{
    margin: 0 $space-norm;
  }
}
.search-box{
  margin-top: $space-norm;
}
.active{
    border-bottom: 10rpx solid #2979ff;
}
</style>
