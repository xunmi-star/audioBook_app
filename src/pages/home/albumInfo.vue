<template>
  <view class="page" :class="[$changeColor('block-bcg')]" :style="$store.state.Seeting.initTheme">
    <Header :cmpData="headerCmp"></Header>
    <!-- 标题信息 -->
    <view class="head-box font-mine" :class="[$changeColor('block-bcg'),$changeColor('block-font2')]">
      <view class="left">
        <u-image :src="$ossUrl + albumInfo.poster" width="180rpx" mode="widthFix"></u-image>
      </view>
      <view class="right">
        <view class="title font-small weight" :class="[$changeColor('block-font')]">{{albumInfo.name}}</view>
        <view class="author">
          <text>作者：{{albumInfo.author}}</text>
        </view>
        <view class="pj">播音: {{albumInfo.createBy}}</view>
        <view class="pj u-line-1">简介: {{albumInfo.introduction }}</view>
        <view class="pj">
          <text>已{{`完结`}}{{total}}章</text>
          <text class="left30">{{albumInfo.playNum}}次播放</text>
        </view>
      </view>
    </view>

    <!-- 音频列表 -->
    <view class="play-box font-medium" :class="[$changeColor('block-bcg')]">
      <view class="head font-medium">
        <view class="left" @click="toPlay(newPlay.id)">
          <text>当前听至：</text>
          <text class="font-mine stress-font weight">{{newPlay.title || '第一集'}}</text>
        </view>
        <view class="right">
          <text class="iconfont" :class="[isAsc ? 'icon-zhengxu':'icon-daoxu-']" @click="changeSort"></text>
          <text class="iconfont icon-zhangjie1" @click="cmpDate.show = true"></text>
          <text class="iconfont" :class="[albumInfo.isSubscribe?'icon-zujianICON-dingyue-bai':'icon-icon_dingyue']" @click="subscribe"></text>
          <text class="iconfont icon-xiazai1 font-extra" @click="toDownload"></text>
        </view>
      </view>

      <view class="list">
        <view class="item" :style="`borderBottom: 1px solid ${$changeBorderColor()}`"  v-for="(item,index) in audioList" :key="index" @click="toPlay(item.id)">
          <view class="left" :class="[item.id === newPlay.id ? 'stress-font':'']" >
            <view class="pj">
              <view class="index">{{ $tool.addZero(item.section) }}</view>
              <text>{{item.title}}</text>
            </view>
            <view class="pj">
              <view class="pj-1">
                <u-icon name="play-right" color=""></u-icon>
                <text>{{item.playNum}}</text>
              </view>
              <view class="pj-1">
                <u-icon name="heart" size="18" color=""></u-icon>
                <text>{{item.collectNum}}</text>
              </view>
              <view class="pj-1">
                <text class="font-big iconfont icon-liuyan"></text>
                <text>{{item.commentNum}}</text>
              </view>
            </view>
          </view>
          <view class="right">
            <text class="font-big iconfont icon-bofang1"></text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部nav -->
    <view class="nav-box font-mine">
     <view class="list" :class="[$changeColor('block-bcg2')]">
      <view class="pj">
        <u-icon name="heart" size="48rpx" color=""></u-icon>
        <view>{{albumInfo.collectNum}}</view>
      </view>
      <view class="pj">
        <text class="font-extra iconfont icon-liuyan"></text>
        <view>{{albumInfo.commentNum}}</view>
      </view>
      <view class="pj">
        <u-icon name="thumb-up" size="48rpx" color=""></u-icon>
        <view>{{albumInfo.likeNum}}</view>
      </view>
      <view class="pj" @click="toPlay(newPlay.id)">
        <view class="btn font-medium">播放</view>
      </view>
     </view>
    </view>

    <!-- 加载跟多 -->
    <u-loadmore  :status="loadStatus"  loading-text="努力加载中"  loadmore-text="轻轻上拉"  nomore-text="实在没有了" />

    <ChapterNav :cmpShow.sync="cmpDate.show" :cmpTitle="cmpDate.title" :cmpStep="cmpDate.step" :cmpTotal="cmpDate.total" :cmpSection.sync="cmpDate.section" :cmpSelectMore.sync="cmpDate.selectMore" :cmpList.sync="cmpDate.list" @getPopupCmp="getCmp"></ChapterNav>
    <Wrap :cmpScrollTop="scrollTop"></Wrap>
  </view>
</template>

<script lang="ts">
import {Vue, Component, Watch} from 'vue-property-decorator'

import Header from '@/components/header.vue'
import Wrap from '@/components/wrap.vue'
import ChapterNav from '@/components/chapterNav.vue'


@Component({name: 'albumInfo', components:{ Header, Wrap, ChapterNav }})
export default class AlbumInfo extends Vue{ 
  private scrollTop: number = 0
  private headerCmp = {
    leftUrl: '/pages/home/index' as string,
    leftIcon: '' as string,
    title: '音频清单' as string, 
    rightUrl: '' as string,
    rightIcon: '' as string,
  }
  private loadStatus: string = 'loadmore' // 组件状态: loading: 加载中   nomore：没有了  loadmore：加载更多
  private albumId: number|null = null
  private albumInfo: any = {}//专辑信息
  private page: number = 1 //分页页码
  private limit: number = 20 //页面长度
  private total: number = 0 //总音频长度
  private isAsc: boolean = true //是否升序
  private pageLock: boolean = true
  private audioList: object[] = [] //音频列表

  private cmpDate = {
    show: false as boolean,
    title: '章节导航' as string, //标题
    step: 20 as number, //步进值
    total: 0 as number, //总的章节数
    section: 0 as number, //当前音频所在的排序
    selectMore: false as boolean, //允许多选
    list: [],
  }

  private newPlay = {
    id: null, //缓存中的最新播放过的音频id
    title: '', //缓存中的最新播放过的音频名
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
        this.getAudioByAlbumId(true)
      },1500)
    }
  }

  onLoad(pass: any){
    this.albumId = Number(pass.id)
    if(pass.fromMyListen){
      this.headerCmp.leftUrl = '/pages/myListen/index'
    }
    if(pass.fromPlay){
      this.headerCmp.leftUrl = '/pages/play/index'
    }
    this.init()
  }

  init(){
    this.loadStatus = 'loadmore'
    this.pageLock = true
    this.audioList = []

    this.getNewPlay()

    if(this.pageLock){
      this.getAudioByAlbumId()
    }
  }

  //接收子组件的值
  getCmp(e: any){
    console.log('接收子组件的值:',e)
    //根据子组件传来的start重新设定页码
    this.page = Math.floor(e.start / this.limit) + 1
    this.getAudioByAlbumId()
  }

  //获取该专辑的最新播放音频id
  getNewPlay(){
    let list = this.$store.state.Play.cacheList
    if(Array.isArray(list)){
      let newPlayAudio = list.find((item: any)=>this.albumId === item.albumId) 
      if(newPlayAudio){
        this.newPlay.id = newPlayAudio.id
        this.newPlay.title = newPlayAudio.title
        this.cmpDate.section = newPlayAudio.section

        this.newPlayPage(newPlayAudio)
      }
    }
  }

  // 计算当前专辑有最新播放记录的音频出现在第几页
  newPlayPage(data: any){
      //向下取整: 当前页码 = 最新播放集数 / 音频长度 + 1 
      let allPage = Math.floor(this.total / this.limit) + 1  
      let newPage = Math.floor(data.section / this.limit) + 1  
      if(!this.isAsc){//如果倒序
        newPage = allPage - newPage + 1
      }
      this.page = newPage
  }

  //根据专辑ID获取音频列表  flag: true 加载更多
  getAudioByAlbumId(flag?: boolean){
    let params = {
      albumId: this.albumId,
      pageNum: this.page,
      pageSize: this.limit,
      isAsc: this.isAsc,
    }
    this.$httpRequest.get(this.$httpApi.getAudioByAlbumId, {params}).then((res: any)=>{
      this.headerCmp.title = res.data.name

      // 组装章节导航数据-beging
      this.cmpDate.total = res.total
      this.cmpDate.step = this.limit
      this.cmpDate.list = this.$tool.initTotal(this.cmpDate.total, this.cmpDate.step, this.cmpDate.section)
      // 组装章节导航数据-end

      this.page++
      if(flag){
        this.audioList = this.audioList.concat(res.rows)
        this.loadStatus = 'loadmore'
        if(this.audioList.length >= res.total){
          this.pageLock = false
          this.loadStatus = 'nomore'
        }
      }else{
        this.albumInfo = res.data
        this.audioList = res.rows
        this.total = res.total
      }
    })
  }

  //升序或倒序
  changeSort(){
    this.isAsc = !this.isAsc
    this.init()
  }

  //订阅或取消订阅
  subscribe(){
    let msg = '订阅成功'
    let parames = {
      url: this.$httpApi.subscribeAlbum,
      data: { albumId: this.albumId }
    }
    if(this.albumInfo.isSubscribe){
      parames.url = this.$httpApi.unSubscribeAlbum
      msg = '取消订阅'
    }
    this.$httpRequest.post(parames.url, parames.data).then((res: any)=>{
      uni.showToast({title: msg})
      setTimeout(()=>{
        this.init()
      },100)
    })
  }

  //前往下载页面
  toDownload(){
    uni.navigateTo({url: `pages/other/downloadMore?id=${this.albumId}`})
  }

  //播放
  toPlay(audioId: number){
    if(this.$store.state.Play.albumId != this.albumId){
      this.$store.commit('Play/setState', {state: 'albumId', value: this.albumId})
    }
    this.$store.commit('Play/setState', {state: 'audioId', value: audioId})
    setTimeout(()=>{
      this.$store.dispatch('Play/play')
      uni.switchTab({url: '/pages/play/index'})
    },500)
  }
}

</script>

<style lang="scss" scoped>
.head-box{
  display: flex;
  align-content: center;
  padding: 50rpx 50rpx 0;
  .right{
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    margin-left: $space-norm;
    overflow: hidden;
  }
}

.play-box{
  margin-top: 86rpx;
  .head{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 $space-block;
    margin: $space-block 0;
    .iconfont{
      font-size: 40rpx;
    }
    .font-extra{
      font-size: 48rpx;
    }
    .left{
      .iconfont{
        color: red;
      }
      text:nth-child(2){
        margin-left: $space-block;
        margin-right: 15rpx;
      }
    }
    .right{
      text{
        margin-left: 40rpx;
      }
    }
  }
  .list{
    .item{
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 $space-norm;
      border-bottom: 1px solid rgba(255,255,255,0.0600);
      margin-bottom: $space-norm;
      .left{
        .pj{
          display: flex;
          align-items: center;
          margin-bottom: 10rpx;
          .pj-1{
            margin-right: $space-norm;
          }
        }
        .index{
          margin-right: 20rpx;
        }
      }
      .right{

      }
    }
  }
}

.nav-box{
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  .list{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $space-norm 50rpx;
    .pj{
      text-align: center;
      text{
        margin-left: 10rpx;
      }
      .btn{
        width: 336rpx;
        margin-top: 0;
        background: rgba(255, 149, 0, 1);
      }
    }
  }
}

.left30{
  margin-left: 30rpx;
}

.u-loadmore{
  padding-bottom: 50rpx;
}
</style>
