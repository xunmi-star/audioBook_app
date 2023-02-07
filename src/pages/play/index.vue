<template>
  <view class="page" :class="[$changeColor('block-bcg')]" :style="$store.state.Seeting.initTheme">
    <Header :cmpData="{leftUrl: '/pages/home/index', title: this.$store.state.Play.albumInfo.name || '专辑名'}"></Header>

    <view class="main" v-if="Object.keys($store.state.Play.audioInfo).length>0">
      <!-- 音频图片 -->
      <view class="img-box" :class="[$changeColor('block-bcg')]">
        <u-image :src="$store.state.Play.albumInfo.poster" :radius="16" height="470rpx" width="68vw"></u-image>
      </view>

      <!-- 音频标题 -->
      <view class="chapter-box">  
        <view class="title weight">{{ $store.state.Play.audioInfo.title }}</view>
        <view class="play-mode font-small">{{$store.state.Play.albumInfo.name}} ({{ $store.state.Play.playMode === 1 ? '本地资源': '网络资源' }})</view>
      </view>
      
      <!-- 定时，下载，目录图标 -->
      <view class="audio-box">
        <view class="event">
          <view class="pj">
            <!-- 定时 -->
            <view class="item" @click="PopupDataState.show = true">
              <text class="font iconfont icon-gongjulan_dingshi"></text>
              <view class="font-mine" v-if="!$store.state.Play.openReciprocal">定时</view>
              <view class="timer font-mine" v-if="$store.state.Play.openReciprocal && $store.state.Play.reciprocalNum">倒数第{{$store.state.Play.reciprocalNum}}集</view>
              <view class="timer">
                <u-count-down 
                  v-if="$store.state.Play.openReciprocal && PopupDataState.value" 
                  :time="PopupDataState.value * 1000" 
                  :format="PopupDataState.value > 1 * 60 *60?'HH:mm:ss':'mm:ss'"
                  @finish="finish">
                </u-count-down>
              </view>
            </view>
            <view class="item" @click="downLoad">
              <text class="font iconfont" :class="[$store.state.Play.audioIsDownloaded?'icon-xiazai stress-font2':'icon-xiazai-1']"></text>
              <view class="font-mine" >{{$store.state.Play.audioIsDownloaded ? '已下载':'下载'}}</view>
            </view>
            <view class="item" @click="doubleCmpData.show = true">
              <text class="font iconfont icon-gongjulan_dingshi"></text>
              <view class="font-mine" >{{ doubleCmpData.value }} X</view>
            </view>
            <navigator class="item" :url="`/pages/home/albumInfo?fromPlay=true&id=${$store.state.Play.albumId}`" redirect hover-class="className">
              <text class="font iconfont icon-qingdan"></text>
              <view class="font-mine" >目录</view>
            </navigator>
          </view>
        </view>

        <!-- 音频相关事件 -->
        <view class="progress"> 
          <u-slider 
            v-model="$store.state.Play.current_time" 
            min="0" 
            :max="$store.state.Play.duration||$store.state.Play.audioInfo.duration" 
            @changing="changing" 
            @change="changeCurrentTime">
          </u-slider>
          <view class="progress-text">
            <u-count-down :time="$store.state.Play.current_time * 1000" format="mm:ss" :autoStart="false"></u-count-down>
            <u-count-down :time="($store.state.Play.duration ||$store.state.Play.audioInfo.duration) * 1000" format="mm:ss" :autoStart="false"></u-count-down>
          </view>
        </view>
        <view class="audio">
          <view class="pj">
            <view class="item" @click="changeTime('-15')"><text class="iconfont icon-time icon-kuaijin"></text></view>
            <view class="item stress-font" @click="playLast()"><text class="iconfont icon-bofang-2 weight"></text></view>
            <view class="item stress-font" @click="playOrPause()"><text class="iconfont" :class="[$store.state.Play.playing?'icon-zanting':'icon-bofang2']"></text></view>
            <view class="item stress-font" @click="playNext()"><text class="iconfont icon-bofang-3 weight"></text></view>
            <view class="item" @click="changeTime('15')"><text class="iconfont icon-time icon-houtui15"></text></view>
          </view>
        </view>

        <!-- 收藏，点赞，评论图标 -->
        <view class="event">
          <view class="pj">
            <view class="item" @click="collect">
              <text class="font iconfont" :class="[$store.state.Play.audioInfo.isCollect?'icon-a-shoucang3 stress-font2':'icon-a-shoucang1']"></text>
              <view class="font-mine" >{{$store.state.Play.audioInfo.collectNum || 0}}</view>
            </view>
            <view class="item" @click="thumbUp">
              <text class="font iconfont" :class="[$store.state.Play.audioInfo.isLike?'icon-icon-dianzan stress-font2':'icon-icon-dianzan1']"></text>
              <view class="font-mine" >{{ $store.state.Play.audioInfo.likeNum || 0 }}</view>
            </view>
            <navigator class="item" :url="`/pages/play/discuss`" redirect hover-class="className">
              <text class="font iconfont icon-liuyan"></text>
              <view class="font-mine" >{{$store.state.Play.audioInfo.commentNum}}</view>
            </navigator>
          </view>
        </view>
      </view>
    </view>

    <!-- 暂无数据 -->
    <view class="no-data-box" v-if="Object.keys($store.state.Play.audioInfo).length<1">
      <navigator url="/pages/home/index" open-type="switchTab">
        <text>暂无数据，</text>
        <text>随便听听</text>
      </navigator>
    </view>

    <!-- 倍速播放组件 -->
    <DoublePopup :cmpShow.sync="doubleCmpData.show" :cmpTitle="doubleCmpData.title" :cmpList.sync="doubleCmpData.list" @getPopupCmp="getDoubleCmp"></DoublePopup>
    <!-- 定时组件 -->
    <Popup :cmpShow.sync="PopupDataState.show" :cmpTitle="PopupDataState.title" :cmpList.sync="PopupDataState.list" @getPopupCmp="getCmp"></Popup>
  </view>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'


import { SeetingModule } from '@/store/modules/seeting'
import { PlayModule } from '@/store/modules/play'
import { enumerateDwonload } from '@/utils/plusDownload'

import Header from '@/components/header.vue'
import Popup from '@/components/popup.vue'
import DoublePopup from '@/components/popup.vue'

// #ifdef H5
const innerAudioContext = uni.createInnerAudioContext(); //web页面时，创建音频函数，允许常规的播放，不允许下载，快进，拖动播放等功能
// #endif

@Component({name: 'playIndex',components: {Header, Popup, DoublePopup}})
export default class playIndex extends Vue {
  private clickIcon = {
    discuss: false as boolean,
  }
  private notice: string = '长度比较大的测试+++++++++++++++++++++章节名'   //章节名滚动条数组，数组长度为1
  private PopupDataState = {
    show: false as boolean,
    title: '定时' as string,
    value: 0 as number,//定时的秒数
    nextAudioId: null as null|number,
    list: [
      {name: '不开启（默认）', value: 0, index: 0, state: 1},
      {name: '播放当前声音', value: 0, index: 1, state: 0},
      {name: '播放2集声音', value: 0, index: 2, state: 0},
      {name: '播放3集声音', value: 0, index: 3, state: 0},
      {name: '10分钟', value: 10, index: 4, state: 0},
      {name: '20分钟', value: 20, index: 5, state: 0},
      {name: '30分钟', value: 30, index: 6, state: 0},
      {name: '60分钟', value: 60, index: 7, state: 0},
      {name: '90分钟', value: 90, index: 8, state: 0},
    ]
  }

  // 倍速弹窗组件
  private doubleCmpData = {
    show: false as boolean,
    title: '倍速' as string,
    value: 1.0 as number,//默认倍速值 支持的倍率有 0.5/0.8/1.0/1.25/1.5
    list: [
      {name: '0.5', value: 0.5, index: 0, state: 0},
      {name: '0.8', value: 0.8, index: 1, state: 0},
      {name: '1.0（默认）', value: 1.0, index: 2, state: 1},
      {name: '1.25', value: 1.25, index: 3, state: 0},
      {name: '1.5', value: 1.5, index: 4, state: 0},
      {name: '2.0', value: 2.0, index: 5, state: 0},
    ]
  }

  //计算属性  评论人数
  get filterCommentNum(): number|string {
    let commentNum: number|string = this.$store.state.Play.audioInfo.commentNum
    if(commentNum<1){
      commentNum = ''
    }
    if(commentNum >99){
      commentNum = `${commentNum}+`
    }
    return commentNum
  }

  onShow(){
    this.init()
  }

  // 初始化
  init() {
    this.getAudioByAlbumId(true)
  }

  //获取专辑信息  flag: true 不改变音频资源
  getAudioByAlbumId(flag?: boolean){
    let params = {
      albumId: PlayModule.albumId
    }
		this.$httpRequest.get(this.$httpApi.getAudioByAlbumId, {params}).then((res:any)=>{
      res.data.total = res.total
      res.data.poster = this.$ossUrl + res.data.poster
      PlayModule.setState({state: 'albumInfo', value: res.data})
       console.log('配置专辑信息',res.data)
      PlayModule.getAudioFromLink({isNoChangeAudio: flag})
		})
  }

  /**
   * @Object 接收倍速播放弹窗组件传过来的数据
   * @parame  index：表示选中的选型索引
   */
  getDoubleCmp(data: any){
    console.log('接收倍数:',data)
    if(Object.keys(data).length > 0){
      this.changeDouble(data)
    }
  }

  // 设置倍速播放 api暂不支持
  changeDouble(data: any){
    this.doubleCmpData.value = this.doubleCmpData.list[data.index].value
    PlayModule.playbackRate(this.doubleCmpData.value)
  }

  /**
   * @Object 接收定时弹窗组件传过来的数据
   * @parame  index：表示选中的选型索引
   */
  getCmp(data: any){
    console.log('接收:',data)
    if(Object.keys(data).length > 0){
      this.startTiming(data)
    }
  }

  //开始定时
  startTiming(data: any){
    //指定播放几集
    if(data.index>0 && data.index<4){
      this.PopupDataState.value = 0
      PlayModule.setState({state: 'openReciprocal', value: true})//开启定时
      PlayModule.setState({state: 'reciprocalNum', value: data.index})//倒数第data.index集
    }
    if(data.index>=4){
      let value = data.value
      this.PopupDataState.value = value * 60
      PlayModule.setState({state: 'openReciprocal', value: true})//开启定时
      PlayModule.setState({state: 'reciprocalNum', value: 0})//关闭倒计时-集数
    }
  }

  //时间倒计结束
  finish(){
    PlayModule.playOrPause(false) //暂停播放
  }

   // 收藏或取消
  collect() {
    let parames = {
      url: this.$httpApi.audioCollect,
      data: { audioId: PlayModule.audioId }
    }
    let msg = '收藏成功'
    if(PlayModule.audioInfo.isCollect){//已经收藏就将其取消收藏
      parames.url = this.$httpApi.revokeCollect
      msg = '取消收藏'
    }
    this.$httpRequest.post(parames.url, parames.data).then((res: any)=>{
      uni.showToast({title: msg})
      setTimeout(()=>{ this.getAudioByAlbumId(true) },1000)
    })
  }

  // 点赞或取消点赞
	thumbUp() {
		let parames = {
			url: this.$httpApi.audioThumbUp,
			data: { audioId:  PlayModule.audioId}
		}
    let msg = '点赞成功'
    if(PlayModule.audioInfo.isLike){
      parames.url = this.$httpApi.revokeThumbUp
      msg = '取消点赞'
    }
		this.$httpRequest.post(parames.url, parames.data).then((res: any)=>{
      uni.showToast({title: msg})
      setTimeout(()=>{ this.getAudioByAlbumId(true) },1000)
		})
	}

  //下载音频
  downLoad(){
    // #ifdef H5
    uni.showToast({title: '请在app中使用', icon: 'none'})
    return
    // #endif

    //将要下载的音频存入下载队列
    let AddInfo = {
      albumInfo: PlayModule.albumInfo,
      audioList: [PlayModule.audioInfo],
      isAdd: true
    }
    PlayModule.addOrRemoveQueue(AddInfo)

    uni.showToast({title: `加入下载队列`, icon: 'none'})

    //单个音频的下载
    let idInfo: any = {
      albumId: PlayModule.albumInfo.id,
      audioId: PlayModule.audioInfo.id
    }
    //根据下载队列创建下载任务后执行下载任务
    PlayModule.runDownloadQueue(idInfo)
  }

  //写评论
  discuss(){
    SeetingModule.setState({state: 'write_show',value: true})
  }

  //目录
  bookList() {}
  handleClick() {}
  //上一章
  playLast(){
    PlayModule.last()
  }
   //下一章
  playNext(){
    PlayModule.next()
  }
  //暂停或播放
  playOrPause(){
    if(PlayModule.once_play){
      PlayModule.play()
    }else{
      PlayModule.playOrPause(!PlayModule.playing)
    }
  }

  //进度条处于拖动过程中
  changing(val: number){
    PlayModule.playOrPause(false)
  }

  //进度条拖动完毕后
  changeCurrentTime(val: number){
    PlayModule.seek(val) //跳到指定时间点
  }

/**
   * @title 增加 or 减少 15秒
   * @param {string } val  parseInt(val)>0: 当前播放增加15秒 parseInt(val)<0: 当前播放减少15秒
   */
  changeTime(val: string) {
    let snap_time: number = PlayModule.current_time + parseInt(val)
    setTimeout(() => {
      PlayModule.seek(snap_time);
    }, 500)
  }
}
</script>

<style lang="scss" scoped>
::v-deep .cmp .header .title{
  flex: 10;
  text-align: left;
}
.page{
  padding: 0 0 100rpx;
}

.no-data-box{
  padding-top: 15vh;
  text-align: center;
  text:nth-last-child(1){
    color: lighten($color-primary, 10);
  }
}

.main{
  margin-top: $header-margin-top;
  margin-bottom: 200rpx;
  overflow: hidden;
  z-index: 1;
}
.content{
  display: flex;
  align-items: center;
  justify-content: space-between;
  .null{
    flex: 3;
  }
  .left{
    flex: 5;
    display: flex;
    align-items: center;
    justify-content: space-around;
    view{
      margin-bottom: 5px;
    }
    .active{
        border-bottom: 5rpx solid #2979ff;
    }
  }
  .right{
    flex: 2;
    text-align: end;
    padding-right: 10rpx;
    .iconfont{
      color: #d8d8d8;
    }
    
  }
}

.img-box {
  display: flex;
  align-content: center;
  justify-content: center;
  margin: 74rpx auto 38rpx;
  border-radius: 32rpx;
  width: 68%;
}

.chapter-box{
  text-align: center;
}

.audio-box {
  width: 100%;
  margin-top: 125rpx;
}
.pj {
  display: flex;
  align-content: center;
  justify-content: space-around;
  width: 100%;
  .item {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    text-align: center;
    line-height: 60rpx;
    .font{
      font-size: 50rpx;
    }
    .icon-time{
      font-size: 48rpx;
    }
  }
}
.event{
  .item{
    width: 33%;
    height: auto;
    .timer{
      width: 100%;
      text-align: center;
    }
  }
}
.progress {
  margin: 70rpx auto 66rpx;
  width: 85vw;
  .progress-text {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32rpx;
    font-size: 20rpx;
  }
}
.audio {
  padding: $space-norm;
  .iconfont{
    font-size: 48rpx;
  }
  .item:nth-child(3) {
    width: 100rpx;
    height: 100rpx;
    .iconfont {
      font-size: 100rpx;
    }
  }
}
.audio-footer{
  text-indent: 2em;
  padding: $space-norm;
}
::v-deep .uni-slider-handle-wrapper{
  background: #c0c4cc !important;
}

.footer-box{
  position: fixed;
  left: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  color: #fff;
  padding: $space-norm 50rpx;
  z-index: 9;
  .left{
    flex: 5;
    display: flex;
    .badge{
      position: relative;
      text{
        position: absolute;
        top:  -20rpx;
        left: $space-block;
        color: $uni-color-error;
      }
    }
  }
  .right{
    flex: 5;
    display: flex;
    align-items: center;

    .pj{
      display: flex;
      flex-direction: column;
      text-align: center;
      .iconfont{
        font-size: 46rpx;
        margin-bottom: 5rpx;
      }
    }
    .pj:nth-child(1){
      border-left: 1px solid $border-color;
    }
  }
}

::v-deep .u-count-down__text{
  color: inherit;
  font-size: $font-mine;
}

</style>
