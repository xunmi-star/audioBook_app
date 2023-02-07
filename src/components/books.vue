<template>
  <view class="cmp">
    <view class="item">
      <view class="img"><image src="@/static/image/book.jpg" mode="widthFix" /></view>
      <view class="play-num">258.6万</view>
      <view class="content">
        <view class="title">盗墓笔记</view>
        <view class="type">探险&盗墓</view>
      </view>
    </view>

    <view class="item">
      <view class="img"><image src="@/static/image/book.jpg" mode="widthFix" /></view>
      <view class="play-num">258.6万</view>
      <view class="content">
        <view class="title">盗墓笔记</view>
        <view class="type">探险&盗墓</view>
      </view>
    </view>
    <view class="item">
      <view class="img"><image src="@/static/image/book.jpg" mode="widthFix" /></view>
      <view class="play-num">258.6万</view>
      <view class="content">
        <view class="title">盗墓笔记</view>
        <view class="type">探险&盗墓</view>
      </view>
    </view>
    <view class="item">
      <view class="img"><image src="@/static/image/book.jpg" mode="widthFix" /></view>
      <view class="play-num">258.6万</view>
      <view class="content">
        <view class="title">盗墓笔记</view>
        <view class="type">探险&盗墓</view>
      </view>
    </view>
    <view class="item">
      <view class="img"><image src="@/static/image/book.jpg" mode="widthFix" /></view>
      <view class="play-num">258.6万</view>
      <view class="content">
        <view class="title">盗墓笔记</view>
        <view class="type">探险&盗墓</view>
      </view>
    </view>

  </view>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'

@Component({name: 'Books'})
export default class Vip extends Vue{
  
}
</script>

<style lang="scss" scoped>
.cmp{
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.item{
  position: relative;
  width: 26%;
  height: 270rpx;
  margin-bottom: $space-norm;
  margin: $space-block;
  text-align: center;
  background: $uni-theme-night-color;
  image{
    width: 100%;
    height: 200rpx;
  }
  .play-num{
    position: absolute;
    width: 100%;
    top: 140rpx;
  }
}
</style>