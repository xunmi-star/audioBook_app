<template>
  <view class="page" :class="[$changeColor('block-bcg')]" :style="$store.state.Seeting.initTheme">
    <Header :cmpData="headerCmp"></Header>

    <view class="nav-box font-small" :class="[$changeColor('block-bcg2')]">
      <view class="left">
        <text class="iconfont icon-shengbobodong"></text>
        <text>共</text>
        <text class="num stress-font">{{albumInfo.total}}</text>
        <text>集，</text>
        <text>已下载</text>
        <text class="num stress-font">{{0}}</text>
        <text>集</text>
      </view>
      <view class="center">
         <!-- 下拉框组件 -->
        <text @click="cmpLimitData.selectDownShow = !cmpLimitData.selectDownShow">分页</text>
        <SelectDown :cmpShow.sync="cmpLimitData.selectDownShow" :cmpPostion="cmpLimitData.position" :cmpList.sync="cmpLimitData.list" @getCmpFromSelectDown="getSelectDownCmp"></SelectDown>
      </view>
      <view class="right" @click="cmpDate.show = true">
        <text class="text">选集({{`${download.start}-${download.end}`}})</text>
        <u-icon name="arrow-down"></u-icon>
      </view>
    </view>

    <view class="list">
      <view class="item" :style="`borderBottom: 1px solid ${$changeBorderColor()}`" :class="[$changeColor('block-bcg')]" v-for="(item,index) in audioList" :key="index">
        <view class="index">{{item.section}}</view>
        <view class="content">
          <view class="left" @click="toPlay(item)">
            <text>{{albumInfo.name}}-{{item.title}}</text>
          </view>
          <view class="right" @click="handleDownload([item])">
            <text class="iconfont font-big" :class="[item.isDownloaded?'icon-xiazai stress-font2':'icon-xiazai-1']"></text>
          </view>
          <view class="bottom">
            <view class="pj">
              <u-icon name="clock" size="16" color=""></u-icon>
              <u-count-down :time="item.duration * 1000" format="mm:ss" :autoStart="false"></u-count-down>
            </view>
            <view class="pj">
              <text class="font-small iconfont icon-wenjianjia"></text>
              <text class="font-small">{{parseFloat(item.size / 1024 / 1024).toFixed(1)}}MB</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="footer-box" :class="[$changeColor('block-bcg2')]">
      <view class="footer">
        <view class="left">
          <view class="but font-small" @click="handleDownload(nowPageAudioList)">一键下载({{`${download.start}-${download.end}`}})</view>
        </view>
        <view class="right" @click="cmpDate.show = true">
          <view class="but font-small">批量选集下载</view>
        </view>
      </view>
    </view>

    <ChapterNav :cmpShow.sync="cmpDate.show" :cmpTitle="cmpDate.title" :cmpStep="cmpDate.step" :cmpTotal="cmpDate.total" :cmpSection.sync="cmpDate.section" :cmpSelectMore.sync="cmpDate.selectMore" :cmpList.sync="cmpDate.list" @getPopupCmp="getCmp"></ChapterNav>
    <Wrap :cmpScrollTop="scrollTop"></Wrap>
  </view>
</template>

<script lang="ts">
import {Vue, Component, Watch} from 'vue-property-decorator'

import Header from '@/components/header.vue'
import Wrap from '@/components/wrap.vue'
import SelectDown from '@/components/selectDown.vue'

import { PlayModule } from '@/store/modules/play'
import ChapterNav from '@/components/chapterNav.vue'

@Component({name: 'DownloadMore', components:{ Header, Wrap, ChapterNav, SelectDown }})
export default class DownloadMore extends Vue{ 
  private scrollTop: number = 0
  private headerCmp = {
    leftUrl: '' as string,
    leftIcon: '' as string,
    title: '下载更多' as string, 
    subtitle: '下载管理' as string,
    rightUrl: '/pages/other/downloading' as string,
  }

  private cmpLimitData: any = {
    selectDownShow: false,
    position: {
      style: {
        marginTop: '20rpx'
      }
    },
    list: [
      {name: '加载5个音频', value: 5, state: 0},
      {name: '加载10个音频', value: 10, state: 1},
      {name: '加载20个音频', value: 20, state: 0},
      {name: '加载50个音频', value: 50, state: 0},
    ]
  }

  private loadStatus: string = 'loadmore' // 组件状态: loading: 加载中   nomore：没有了  loadmore：加载更多
  private albumId: number|null = null
  private albumInfo: any = {}//专辑信息
  private page: number = 1 //分页页码
  private limit: number = 10 //页面长度 默认为10
  private pageLock: boolean = true
  private audioList: object[] = [] //音频列表
  private nowPageAudioList: object[] = [] //当前页码的音频列表

  private download: any = {
    start: null,//下载的初始section
    end: null,//下载的结束section
    list: [],//批量下载
  } 

  private cmpDate = {
    show: false as boolean,
    title: '下载导航' as string, //标题
    step: 20 as number, //步进值
    total: 0 as number, //总的章节数
    section: 0 as number, //当前音频所在的排序
    selectMore: false as boolean, //允许多选
    list: [],
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

   /**
   * 深度监听audioList对象
   * param {boolean} immediate 侦听开始后是否立即调用该回调函数
   * param {boolean} deep 是否开启深度侦听
   */
  @Watch('audioList',{immediate: false, deep: true})
  watchAudioList(){
  
  }

  onLoad(pass: any){
    this.albumId = Number(pass.id)
    this.init()
  }

  init(){
    this.page = 1
    this.audioList = []
    if(this.pageLock){
      this.getAudioByAlbumId()
    }
  }

  //接收limit下拉框组件的值
  getSelectDownCmp(e: any){
    this.limit = e.value
    this.init()
  }

  //接收子组件的值
  getCmp(e: any){
    console.log('接收子组件的值:',e)
    //根据子组件传来的start重新设定页码
    this.page = Math.floor(e.start / this.limit) + 1
    this.getAudioByAlbumId()
  }

  //根据专辑ID获取音频列表  flag: true 加载更多
  getAudioByAlbumId(flag?: boolean){
    let params = {
      albumId: this.albumId,
      pageNum: this.page,
      pageSize: this.limit,
    }
    this.$httpRequest.get(this.$httpApi.getAudioByAlbumId, {params}).then((res: any)=>{

      // 组装章节导航数据-beging
      this.cmpDate.total = res.total
      this.cmpDate.step = this.limit
      this.cmpDate.list = this.$tool.initTotal(this.cmpDate.total, this.cmpDate.step, this.cmpDate.section)
      // 组装章节导航数据-end

      this.nowPageAudioList = res.rows

      this.download.start = res.rows[0].section || null
      this.download.end = res.rows[res.rows.length-1].section || null
      this.page++

      if(flag){
        this.audioList = this.audioList.concat(res.rows)
        this.loadStatus = 'loadmore'
        if(this.audioList.length >= res.total){
          this.pageLock = false
          this.loadStatus = 'nomore'
        }
      }else{
        res.data.total = res.total
        this.albumInfo = res.data
        this.audioList = res.rows
      }
    }).then(()=>{
      // #ifdef APP-PLUS
      this.getDownloadedAlbum()
      // #endif
    })
  }

  //更具已经下载的专辑配置音频信息
  async getDownloadedAlbum(){
    let list = await PlayModule.initDownloadedFile()
    if(Array.isArray(list) && list.length>0){
      list.map((item: any, index: number)=>{
        if(item.id === this.albumId){
          item.audioList.map((childItem: any)=>{
            this.audioList.map((audioItem: any)=>{
              if(audioItem.id === childItem.id){
                audioItem.isDownloaded = true
                this.$set(audioItem, 'isDownloaded', true)
              }
            })
          })
        }
      })
    }
  }

  //点击下载
  handleDownload(audioList: any){
    let albumInfo = (uni as any).$u.deepClone(this.albumInfo)
    if(Array.isArray(audioList)){
      audioList.map((item: any)=>{
        item.link = this.$ossUrl + item.link
        item.poster = this.$ossUrl + albumInfo.poster
      })

      //将要下载的音频存入下载队列
      let parames = {
        albumInfo: albumInfo,
        audioList: audioList,
        isAdd: true
      }
      //添加到下载队列
      PlayModule.addOrRemoveQueue(parames)
 	  uni.showToast({title: `加入下载队列`, icon: 'none'})
      //当前存在正在下载的音频任务时，将其加入下载队列，但不立马执行下载任务
      if(PlayModule.dtaskListenKeyArr.length>0){
        console.log('当前存在正在下载的音频任务,加入下载队列但不执行下载任务',PlayModule.dtaskListenKeyArr)
        return
      }

      //默认下载添加的音频数组的第一个
      let idInfo: any = {};
      if(audioList.length === 1){
        idInfo.albumId = albumInfo.id
        idInfo.audioId = audioList[0].id
      }

      //根据下载队列创建下载任务后执行下载任务
      PlayModule.runDownloadQueue(idInfo)
    }

  }

  //播放
  toPlay(item: any){
    this.$store.commit('Play/setState', {state: 'albumId', value: this.albumId})
    this.$store.commit('Play/setState', {state: 'albumInfo', value: this.albumInfo})

    this.$store.commit('Play/setState', {state: 'audioId', value: item.id})
    this.$store.commit('Play/setState', {state: 'audioInfo', value: item})
    setTimeout(()=>{
      // #ifdef APP-PLUS
      this.$store.dispatch('Play/play')
      // #endif
      uni.switchTab({url: '/pages/play/index'})
    },500)
  }
}

</script>

<style lang="scss" scoped>
.nav-box{
  position: fixed;
  top: $header-margin-top;
  left: 0;
  width: 100%;
  height: 50rpx;
  z-index: 9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-block 0;
  border-top: 1px solid rgba(255,255,255,0.2);
  border-bottom: 1px solid rgba(255,255,255,0.2);
  .left{
    display: flex;
    align-items: center;
    margin-left: $space-block;
    .num{
      margin: 0 10rpx;
    }
  }
  .iconfont{
    font-size: 36rpx;
  }
  .center{
    position: relative;
    text-align: center;
  }
  .right{
    margin-right: $space-block;
  }
}

.list{
  padding-top: $header-margin-top + 50rpx + 50rpx;
  margin-bottom: 100rpx;
  .item{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $space-block $space-norm;
    .index{
      width: 10%;
    }
    .content{
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      width: 90%;
      .left{
        width: 85%;
      }
      .right{
        width: 15%;
        text-align: right;
        .iconfont{
          font-size: 40rpx;
        }
        .iconfont:nth-last-child(1){
          margin-left: $space-block;
        }
      }
      .bottom{
        display: flex;
        width: 100%;
        padding: $space-block 0;
        .pj{
          display: flex;
          align-items: center;
          margin-right: $space-norm;
          text{
            margin-left: $border-small;
          }
          ::v-deep .u-count-down__text{
            color: inherit;
            font-size: $font-small;
            margin-left: $border-small;
          }
        }
      }
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
    color: #ffffff;
    .but{
      width: 40vw;
      padding: 16rpx 0;
      border-radius: 50rpx;
      background: $uni-color-error;
      text-align: center;
    }
    .right{
      .but{
        background: rgba(255, 149, 0, 1);
      }
    }

    .iconfont{
      margin-right: $border-small;
    }
  }
}

.u-loadmore{
  padding-bottom: 50rpx;
}
</style>
