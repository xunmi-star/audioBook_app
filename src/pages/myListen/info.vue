<template>
  <view class="page" :class="[$changeColor('block-bcg')]" :style="$store.state.Seeting.initTheme">
    <view class="theme-box">
      <image :src="`/static/image/${$store.state.Seeting.theme.name}.webp`" mode="" />
    </view>
    <Header :cmpData="headerCmp"></Header>
    <view class="head-box">
      <view class="left">
        <u-image :src="$ossUrl + albumInfo.poster" width="150rpx" height="150rpx" radius="10"></u-image>
        <view class="content">
          <view class="weight u-line-2">{{albumInfo.name}}</view>
          <view class="section font-small">
            <text class="iconfont icon-shengbobodong"></text>
            <text>共{{albumInfo.total}}集</text>
            <text>已收藏 {{audioList.length}}集</text>
          </view>
        </view>
      </view>
    </view>

    <view class="nav-box">
      <view class="lfet" @click="isEdit = !isEdit">
        <text class="iconfont" :class="[isEdit?'icon-piliangcaozuo':'icon-fenlei']"></text>
        <text class="text">批量操作</text>
      </view>
    </view>

    <view class="list-box">
      <view class="item" v-for="(item,index) in audioList" :key="index">
        <view class="left" @click="toPlay(item)">
          <view class="name weight u-line-1">{{item.title}}</view>
        </view>
        <view class="right" @click="item.isSelect = !item.isSelect">
          <text v-if="isEdit" class="iconfont font-big" :class="[item.isSelect?'icon-yuanxingxuanzhong':'icon-yuanxingweixuanzhong']"></text>
        </view>
      </view>
    </view>

    <view class="footer-box" v-if="isEdit">
      <view class="footer">
        <view class="left" @click="clickAllSelect">
          <text class="iconfont font-big" :class="[isAllSelect?'icon-yuanxingxuanzhong':'icon-yuanxingweixuanzhong']"></text>
          <text>全选</text>
        </view>
        <view class="right" @click="revokeCollect">
          <view class="but font-small">取消收藏</view>
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

@Component({name: 'myListenInfo', components:{ Header, Wrap }})
export default class myListenInfo extends Vue{ 
  private scrollTop: number = 0
  private headerCmp = {
    leftUrl: '/pages/myListen/index' as string,
    leftIcon: '' as string,
    title: '收藏详情' as string, 
    rightUrl: '' as string,
    rightIcon: '' as string,
  }
  private loadStatus: string = 'loadmore' // 组件状态: loading: 加载中   nomore：没有了  loadmore：加载更多
  private albumId: number|null = null
  private albumInfo: any = {}//专辑信息
  private page: number = 1 //分页页码
  private pageLock: boolean = true
  private audioList: object[] = [] //音频列表

  private isAllSelect: boolean = false//全部选择
  private isEdit: boolean = false//批量操作
  private cleanAudioList: object[] = []//需要删除的音频列表

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

  //滚动距离
  onPageScroll(e: any) {
		this.scrollTop = e.scrollTop;
	}

  //滚动到底部
  onReachBottom(e: any) {
    if(this.pageLock){
      this.loadStatus = 'loading'
      setTimeout(()=>{
        this.getCollectAudioList(true)
      },1500)
    }
  }

  onLoad(pass: any){
    this.albumId = pass.id
    this.init()
  }

  init(){
    this.loadStatus = 'loadmore'
    this.pageLock = true
    this.audioList = []
    this.getAudioByAlbumId()
    this.getCollectAudioList()
  }

  //根据专辑ID获取专辑信息 pageNum=1&pageSize=10&albumId=10
  getAudioByAlbumId(flag?: boolean){
    let params = {
      albumId: this.albumId,
      pageNum: this.page,
      pageSize: 10,
    }
    this.$httpRequest.get(this.$httpApi.getAudioByAlbumId, {params}).then((res: any)=>{
      res.data.total = res.total
      this.albumInfo = res.data
    }) 
  }

  //根据专辑ID获取音频收藏列表  flag: true 加载更多
  getCollectAudioList(flag?: boolean){
    let params = {
      albumId: this.albumId,
      pageNum: this.page,
      pageSize: 10,
    }
    this.$httpRequest.get(this.$httpApi.collectAudioList, {params}).then((res: any)=>{
      this.page++
      if(flag){
        this.loadStatus = 'loadmore'
        if(res.rows.length < 10){
          this.pageLock = false
          this.loadStatus = 'nomore'
        }
      }else{
        res.rows.map((item: any)=>{
          this.$set(item,'isSelect',false)
        })
        this.audioList = res.rows   
      }
    })
    
  }

  //单个音频选中情况
  editSelect(){
    let arr: object[] = []

    //是否全部的音频都选中了
    let allSelectFlag = this.audioList.every((item: any)=>{ return item.isSelect === true })
    this.isAllSelect = allSelectFlag

    this.audioList.map((item: any)=>{
      if(item.isSelect){
        arr.push(item.audioId)
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

  //取消音频收藏
  revokeCollect(){
    let parames = {
      url: this.$httpApi.revokeCollect,
      data: { audioId: this.cleanAudioList }
    }
    this.$httpRequest.post(parames.url, parames.data).then((res: any)=>{
      uni.showToast({title: '取消成功'})
      setTimeout(()=>{
        this.init()
      },500)
    })
  }

  //播放
  toPlay(audioId: number){
    if(this.$store.state.Play.albumId != this.albumId){
      this.$store.commit('Play/setState', {state: 'albumId', value: this.albumId})
    }
    this.$store.commit('Play/setState', {state: 'audioId', value: audioId})
    setTimeout(()=>{
      // #ifdef APP-PLUS
      this.$store.dispatch('Play/play',0)
      // #endif
      uni.switchTab({url: '/pages/play/index'})
    },500)
  }

  demo(){
    uni.showToast({title: '暂未实施', icon: 'none'})
  }
}

</script>

<style lang="scss" scoped>
.head-box{
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: $header-margin-top;
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