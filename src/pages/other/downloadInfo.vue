<template>
  <view class="page" :class="[$changeColor('block-bcg')]" :style="$store.state.Seeting.initTheme">
    <view class="theme-box">
      <image :src="`/static/image/${$store.state.Seeting.theme.name}.webp`" mode="" />
    </view>
    <Header :cmpData="headerCmp"></Header>
    <view class="head-box">
      <view class="left">
        <u-image :src="albumInfo.poster" width="150rpx" height="150rpx" radius="10"></u-image>
        <view class="content">
          <view class="weight u-line-2">{{albumInfo.name}}</view>
          <view class="section font-small">
            <text class="iconfont icon-shengbobodong"></text>
            <text>共{{albumInfo.total}}集</text>
            <text>已下载 {{audioList.length}}集</text>
          </view>
        </view>
      </view>
      <view class="right">
        <text class="but font-small" @click="toDownload">下载更多</text>
      </view>
    </view>

    <view class="nav-box">
      <view class="lfet" @click="isEdit = !isEdit">
        <text class="iconfont" :class="[isEdit?'icon-piliangcaozuo':'icon-fenlei']"></text>
        <text class="text">批量操作</text>
      </view>
      <view class="right">
        <text class="iconfont icon-zhengxu"></text>
        <text class="text">正序</text>
        <text class="iconfont icon-daoxu-"></text>
        <text class="text">倒序</text>
      </view>
    </view>

    <view class="list-box">
      <view class="item" :class="[item.isLatestPlay ? 'stress-font':'']" v-for="(item,index) in audioList" :key="index">
        <view class="left" @click="toPlay(item)">
          <view class="name weight u-line-1">{{`${albumInfo.name}-${item.title}`}}</view>
          <view class="pj font-small">
            <view class="div">
              <u-icon name="clock" size="16" color=""></u-icon>
              <text>{{ item.playedTime > 0 ? $u.timeFormat(item.playedTime * 1000, 'MM:ss') : '00: 00' }}</text>
            </view>
            <view class="div">
              <text class="font-small iconfont icon-wenjianjia"></text>
              <text>{{parseFloat(item.audioSize / 1024 / 1024).toFixed(1)}}MB</text>
            </view>
          </view>
        </view>
        <view class="right" @click="item.isSelect = !item.isSelect">
          <text v-if="isEdit" class="iconfont font-big" :class="[item.isSelect?'icon-yuanxingxuanzhong':'icon-yuanxingweixuanzhong']"></text>
        </view>
      </view>
    </view>

    <view class="footer-box" :class="[$changeColor('block-bcg2')]" v-if="isEdit">
      <view class="footer">
        <view class="left" @click="clickAllSelect">
          <text class="iconfont font-big" :class="[isAllSelect?'icon-yuanxingxuanzhong':'icon-yuanxingweixuanzhong']"></text>
          <text>全选</text>
        </view>
        <view class="right" @click="cleanAudio">
          <view class="but font-small">删除</view>
        </view>
      </view>
    </view>
    <Wrap :cmpScrollTop="scrollTop"></Wrap>
  </view>
</template>

<script lang="ts">
import {Vue, Component, Watch} from 'vue-property-decorator'

import Header from '@/components/header.vue'
import Wrap from '@/components/wrap.vue'

import { removeFile, removeFolder } from '@/utils/plusDownload'
import { PlayModule } from '@/store/modules/play'

@Component({name: 'myListenInfo', components:{ Header, Wrap }})
export default class myListenInfo extends Vue{ 
  private scrollTop: number = 0
  private headerCmp = {
    leftUrl: '/pages/other/myDownload' as string,
    leftIcon: '' as string,
    title: '下载详情' as string, 
    rightUrl: '' as string,
    rightIcon: '' as string,
  }
  private albumId: number|null = null
  private albumInfo: any = {}//专辑信息
  private audioList: object[] = [] //音频列表
  private cacheAlbumList: any= [] //专辑列表
  private isAllSelect: boolean = false//全部选择
  private isEdit: boolean = false//批量操作
  private cleanAudioList: object[] = []//需要删除的音频列表

  //滚动距离
  onPageScroll(e: any) {
		this.scrollTop = e.scrollTop;
	}

   /**
   * 深度监听audioList对象
   * param {boolean} immediate 侦听开始后是否立即调用该回调函数
   * param {boolean} deep 是否开启深度侦听
   */
  @Watch('audioList',{immediate: false, deep: true})
  watchAudioList(){
    if(this.isEdit){
      this.editSelect()
    }
  }

  onLoad(pass: any){
    this.albumId = Number(pass.id)
    this.init()
  }

  init(){
    this.audioList = []
    this.getCacheData()
  }

  //获取本地下载好的专辑
  async getCacheData(){
    uni.showLoading({title: '资源加载中...'})
    let list = await PlayModule.initDownloadedFile() || []
    uni.hideLoading()
    this.cacheAlbumList = list
    this.buildData()
  }

  //配置本地下载好的音频列表
  buildData(){
    let list = this.cacheAlbumList
    let cacheList = (uni as any).$u.deepClone(uni.getStorageSync(this.$Storage.keysObj.cacheList)) || []
    if(Array.isArray(list) && list.length>0){
      list.map((item: any)=>{
        if(item.id === this.albumId){
          this.albumInfo = item
          let latestPlayTimes: number = 0 //音频的最近播放日期
          let latestPlayIndex: number = 0 //音频的最近播放索引

          item.audioList.map((audioItem: any, audioIndex: number)=>{
            //音频默认不选中
            this.$set(audioItem,'isSelect',false)

            //赋予播放进度
            audioItem.playedTime = 0
            cacheList.map((cacheItem: any)=>{
              if(audioItem.id === cacheItem.id){
                audioItem.playedTime = cacheItem.playedTime

                //标注最近播放的音频索引
                let playTimes = new Date(cacheItem.newPlayDate || 0).getTime()
                if(playTimes >= latestPlayTimes){
                  latestPlayTimes = playTimes
                  latestPlayIndex = audioIndex
                }
              }
            })
          })
          item.audioList[latestPlayIndex].isLatestPlay = true
          this.audioList = item.audioList || []
        }
      })
    }
  }

  //播放
  toPlay(item: any){
    //如果处理编辑状态，则不跳转到播放页面
    if(this.isEdit){
      uni.showToast({title: '批量操作', icon: 'none'})
      return
    }

    //提取出纯粹的专辑信息
    const {audioList, ...snapAlbumInfo} = this.albumInfo

    this.$store.commit('Play/setState', {state: 'albumId', value: this.albumId})
    this.$store.commit('Play/setState', {state: 'albumInfo', value: snapAlbumInfo})

    this.$store.commit('Play/setState', {state: 'audioId', value: item.id})
    this.$store.commit('Play/setState', {state: 'audioInfo', value: item})
    setTimeout(()=>{
      // #ifdef APP-PLUS
      this.$store.dispatch('Play/play',true)
      // #endif
      uni.switchTab({url: '/pages/play/index'})
    },500)
  }

  //单个音频选中情况
  editSelect(){
    let arr: object[] = []

    //是否全部的音频都选中了
    let allSelectFlag = this.audioList.every((item: any)=>{ return item.isSelect === true })
    this.isAllSelect = allSelectFlag

    this.audioList.map((item: any)=>{
      if(item.isSelect){
        arr.push({link: item.link})
      }
    })
    this.cleanAudioList = arr
  }

  //点击全选按钮
  clickAllSelect(){
    this.isAllSelect = !this.isAllSelect
    this.audioList.map((item: any)=>{
      item.isSelect = this.isAllSelect
    })
  }

  //本地音频删除
  cleanAudio(){
    if(this.isAllSelect){//按专辑文件夹删除资源
      let path = `${this.albumInfo.name}-${this.albumInfo.id}`
      removeFolder(path).then((res:any)=>{
        uni.showToast({title: '专辑删除成功', icon: 'none'})
        setTimeout(()=>{this.init()},1500)
      })
    }else{//按音频删除资源
      removeFile(this.cleanAudioList).then((res:any)=>{
        uni.showToast({title: '音频删除成功', icon: 'none'})
        setTimeout(()=>{this.init()},1500)
      })
    }
  }

  //前往下载页面
  toDownload(){
    uni.navigateTo({url: `pages/other/downloadMore?id=${this.albumId}`})
  }

}

</script>

<style lang="scss" scoped>
.head-box{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-block;
  width: 100%;
  height: 150rpx;
  .left{
    flex: 7.8;
    display: flex;
    height: 100%;
    .content{
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      margin: 0 $space-block;
      .section{
        text:nth-last-child(1){
          margin-left: $space-block;
        }
      }
    }
  }
  .right{
    flex: 2.2;
    .but{
      background: rgba(255,255,255,0.6);
      padding: 8rpx 15rpx;
      border-radius: $space-block;
    }
  }
}

.nav-box{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-block;
  border-top: 1px solid rgba(255,255,255,0.2);
  border-bottom: 1px solid rgba(255,255,255,0.2);
  .text{
    margin-left: 10rpx;
  }
  .iconfont{
    font-size: 36rpx;
  }
  .right{
    text:nth-child(3){
      margin-left: $space-norm;
    }
  }
}

.list-box{
  padding: $space-block $space-block 100rpx;
  .item{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $space-norm;
    .left{
      width: 85%;
      .pj{
        display: flex;
        margin-top: 8rpx;
        color: rgba(255,255,255,0.6);
        .div{
          text:nth-child(2){
            margin-left: 10rpx;
          }
          ::v-deep .uicon-clock{
            color: rgba(255,255,255,0.6) !important;
          }
        }
        view:nth-child(2){
          margin-left: 50rpx;
        }
      }
    }
    .right{
      width: 10%;
      text-align: right;
    }
  }
}

.footer-box{
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 9;
  .footer{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $space-block;
    .but{
      padding: 10rpx $space-block;
      border-radius: 15rpx;
      background: $uni-color-error;
    }
    .iconfont{
      margin-right: 10rpx;
    }
  }
}

.u-loadmore{
  padding-bottom: 50rpx;
}
</style>
