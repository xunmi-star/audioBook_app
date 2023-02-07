<template>
  <view class="page" :class="[$changeColor('block-bcg')]" :style="$store.state.Seeting.initTheme">
    <Header :cmpData="headerCmp"></Header>
    <!-- 专辑 -->
    <view class="card-box">
      <view class="card">
        <view class="item" :class="[$changeColor('block-bcg2')]" v-for="(item,index) in cacheAlbumList" :key="index">
          <view class="left">
            <u-image :src="item.poster" mode="widthFix" width="200rpx" height="200rpx"></u-image>
          </view>
          <navigator class="center" :url="`/pages/other/downloadInfo?id=${item.id}`">
            <view class="pj">
                <text class="weight">{{item.name}}</text>
            </view>
            <view class="pj">作者：{{item.author}}</view>
            <view class="pj">播音：{{item.createBy}}</view>
            <view class="pj2">
              <view class="div1">
                <text class="iconfont icon-wenjianjia"></text>
                <text>{{parseFloat(item.albumSize / 1024 / 1024).toFixed(1)}}MB</text>
              </view>
            </view>
          </navigator>
          <view class="right" @click="clean(item)">
            <u-icon name="trash" size="28" color=""></u-icon>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

import Header from '@/components/header.vue'

import { PlayModule } from '@/store/modules/play'

import { removeFolder } from '@/utils/plusDownload'

//下载
@Component({name: 'myDownload', components:{ Header }})
export default class DownLoad extends Vue{
  private headerCmp = {
    leftUrl: '/pages/mine/index' as string,
    leftIcon: '' as string,
    title: '已下载' as string, 
    subtitle: '正在下载' as string,
    rightUrl: '/pages/other/downloading' as string,
  }

  private cacheAlbumList: any = []

  onShow(){
    this.init()
  }

  init(){
    // #ifdef APP-PLUS
    this.getDownloadedFile()
    // #endif
  }

  //获取本地下载好的文件
  async getDownloadedFile(){
    this.cacheAlbumList = []
    uni.showLoading({title: '资源加载中...'})
    let list = await PlayModule.initDownloadedFile()
    console.log('资源列表:',list)
    uni.hideLoading()
    this.cacheAlbumList = list
  }

  // 删除专辑
  clean(item: any){
    let folder = `${item.name}-${item.id}`
    removeFolder(folder).then((res:any)=>{
      uni.showToast({title: '专辑删除成功'})
      setTimeout(()=>{
        this.init()
      },1500)
    })
  }
}
</script>

<style lang="scss" scoped>
$width: 45rpx;
$height: 180rpx;
.card-box{
  margin: $header-margin-top $space-norm;
  .card{
    .title{
      padding: 5rpx $space-block;
    }
    .item{
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: $space-block;
      padding: $space-block;
      height: $height;
      .left{
        width: $height;
        overflow: hidden;
      }
      .center{
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width: 60%;
        height: 100%;
        margin-left: $space-block;
        .pj{
          font-size: 28rpx;
          overflow: hidden;
          .div1{
            width: 70%;
            display: flex;
            justify-content: flex-start;
            overflow: hidden;
          }
        }
        .pj2{
          display: flex;
          align-items: center;
          font-size: 24rpx;
          .div1{
            display: flex;
            align-items: center;
            text:nth-last-child(1){
              margin-left: 10rpx;
            }
          }
          .schedule{
            margin-left: 15%;
            text:nth-last-child(1){
              margin-left: 10rpx;
            }
          }
        }
      }
      .right{
        height: $height;
        ::v-deep .uicon-trash{
          line-height: $height !important;
        }
        .iconfont{
          line-height: $height;
          font-size: 50rpx;
        }
      }
    }
  }
}

.act{
  color: #facd91;
  font-weight: bold;
  border-radius: $space-block;
  border: 1px solid rgba(255,255,255,0.8);
  background: #3a3a3a;
}

.weight{
  font-weight: bold;
}
</style>
