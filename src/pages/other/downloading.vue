<template>
  <view class="page" :class="[$changeColor('block-bcg')]" :style="$store.state.Seeting.initTheme">
    <Header :cmpData="headerCmp"></Header>

    <view class="card-box">
      <view class="card" v-for="(item, albumIndex) in $store.state.Play.downloadQueue || []" :key="albumIndex">
        <view class="head weight">
          <view class="title">{{ item.name }}</view>
          <view class="right font-small">
            <text @click="startOrStop({playing: true, albumId: item.id, albumName: item.name, audioList: item.audioList})">开始</text>
            <text @click="startOrStop({playing: false, albumId: item.id, albumName: item.name, audioList: item.audioList})">暂停</text>
            <text @click="remove(item, item.audioList)">取消</text>
            <u-icon name="arrow-down" @click="openOrClose($store.state.Play.downloadQueue, albumIndex)"></u-icon>
          </view>
        </view>
        <view class="list" v-for="audioItem in item.audioList" :key="audioItem.id">
          <view class="pj font-medium" v-show="audioItem.downloadState !== 4 && item.show!==false">
            <view class="left">
              <text>{{audioItem.title}}</text>
            </view>
            <view class="center">
              <u-line-progress :percentage="parseInt((audioItem.downloadedSize / audioItem.totalSize) * 100) || 0" :height="12" activeColor="#19be6b"></u-line-progress>
            </view>
            <view class="right">
              <text 
                class="iconfont" 
                :class="[audioItem.downloadState===3?'icon-zanting':audioItem.isDownloading?'icon-shijian':'icon-bofang2']" 
                @click="startOrStop({playing: !audioItem.isDownloading, downloadState: audioItem.downloadState, albumId: item.id, albumName: item.name, audioList: [audioItem]})"
              ></text>
              <text class="iconfont" @click="remove(item, [audioItem])">X</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";

import { PlayModule } from '@/store/modules/play'
import { removeDownloadDtask } from '@/utils/plusDownload'

import Header from "@/components/header.vue";

@Component({ name: "downloading", components: { Header } })
export default class downloading extends Vue {
  private headerCmp = {
    leftUrl: "/pages/other/myDownload" as string,
    leftIcon: "" as string,
    title: "下载中" as string,
  };

  /**
   * 深度监听任务队列，有变化时，更新数据
   * param {boolean} immediate 侦听开始后是否立即调用该回调函数
   * param {boolean} deep 是否开启深度侦听
   */
  @Watch('$store.state.Play.downloadQueue', {immediate: true, deep: true})
  watchDownloadQueue(newVal: any, oldValue: any){
    //可能会短时间内触发多次，故此用了防抖处理
    // console.log('触发队列监听-new:',newVal) 
    // console.log('触发队列监听-old:',oldValue)

    // (uni as any).$u.debounce(this.getDownloadQueue, 500)
  } 

  onLoad() {
    this.init()
  }

  init() {
    
  }

  //展开or折叠专辑(修改下载队列里某专辑的show属性)  TODO
  openOrClose(downloadQueue: any, albumIndex: number, ){
    let list = (uni as any).$u.deepClone(downloadQueue) || []
    if(typeof(list[albumIndex].show) === 'undefined'){
      list[albumIndex].show = true
    }
    list[albumIndex].show = !list[albumIndex].show
    PlayModule.setState({state: 'downloadQueue', value: list})
  }

  /**
   * 开始 or 暂停
   * data {boolean} playing 是否下载
   * data {number} downloadState 下载状态
   * data {number} albumId 专辑id
   * data {string} albumName 专辑名
   * data {object[]} audioList 音频列表
   */
  startOrStop(data: any){
    let {playing, downloadState, albumId, albumName, audioList} = data
    console.log(`准备${playing?'下载':'暂停'}-${downloadState}**${audioList.length}`)
    let param: any = {
      isAllEdit: false,
      isStart: playing,
      albumId: albumId,
      audioList: audioList,
    }

    //特殊情况-允许单个音频从等待状态直接下载的标志
    let isSpecialLoading = false 

    //没有下载状态码或为5 && 原本是打算暂停此任务 && 是对单个音频的操作
    if((!downloadState || downloadState === 5) && !playing && audioList.length === 1){
      param.isStart = true

      isSpecialLoading = true
    }

    PlayModule.startOrStopDownloadQueue(param)

    //单个音频的下载时需要的参数
    let idInfo: any = {
      isSpecialLoading: false,
      albumId: albumId,
      audioId: audioList[0].id //默认下载列表里的第一个音频
    };

    //音频下载
    if(playing){
      console.log('音频下载:',)
      //当前存在正在下载的音频任务且此次操作为批量下载，则将其加入下载队列，但不立马执行下载任务（下载整个专辑）
      if(PlayModule.dtaskListenKeyArr.length>0 && audioList.length>1){
        console.log('当前存在正在下载的音频任务,加入下载队列但不执行下载任务',PlayModule.dtaskListenKeyArr)
        return
      }

      //单个音频的下载(多个音频下载时默认下载最前面的一个音频)
      PlayModule.runDownloadQueue(idInfo) 
    }

    //音频暂停
    if(!playing){
      console.log('音频暂停:',)
      //特殊情况-单个音频从等待状态直接下载
      if(isSpecialLoading){
        console.log('特殊情况-单个音频从等待状态直接下载', PlayModule.downloadQueue)
        idInfo.isSpecialLoading = true
        PlayModule.runDownloadQueue(idInfo) 
        return
      }

      // 暂停一个音频or专辑
      audioList.map(async (item: any, index: number)=>{
        await PlayModule.editDtaskStopArr({albumId: albumId, audioId: item.id})
        //暂停完毕后，执行后续音频的下载
        if((index+1) === audioList.length){
          PlayModule.runDownloadQueue({})
        }
      })
    }
  }

  //移除下载任务
  remove(albumInfo: number, audioList: object[]){
    //如果没有这一步的深拷贝，vuex里的数据会被改动，页面效果就是当前的下载队列音频会暂时消失
    let myAlbumInfo =(uni as any).$u.deepClone(albumInfo)

    let removeInfo: any = {
      albumInfo: myAlbumInfo,
      audioList: audioList,
      isHandAbort: true,
    }
    //移除removeInfo.albumInfo里多余的音频列表
    delete removeInfo.albumInfo.audioList

    //从枚举移除(取消下载任务)
    removeDownloadDtask(removeInfo)
  }
}
</script>

<style lang="scss" scoped>
.card-box {
  margin: 0 $space-norm;
  .card{
    margin: $space-norm 0;
    .head{
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid $border-color;
      padding: 10rpx 0;
      .right{
        text{
          margin: 20rpx;
        }
      }
    }
    .list{
      .pj{
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10rpx 0;
        .left{
          flex: 3;
        }
        .center{
          width: 200rpx;
        }
        text{
          margin: 0 20rpx;
        }
      }
    }
  }
}

.demo{
  display: flex;

}

</style>