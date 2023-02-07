<template>
  <view class="page" :class="[$changeColor('block-bcg')]" :style="$store.state.Seeting.initTheme">
    <Header :cmpData="headerCmp"></Header>
    <view class="card-box">
      <view class="card" v-for="(item,index) in list" :key="index">
        <view class="title weight" v-if="item.label">{{item.label}}</view>
        <view class="item" :class="[$changeColor('block-bcg2')]" v-for="(item,index2) in item.childList" :key="index2">
          <view class="left">
            <u-image :src="item.poster" width="120rpx" mode="widthFix"></u-image>
          </view>
          <view class="right" @click="toPlay(item)">
            <view class="pj">
                <text class="weight">{{`${item.name}-${item.title}`}}</text>
            </view>
            <view class="pj2">
              <view class="div1">
                <u-icon name="clock" color=""></u-icon>
                <text>{{ item.duration > 0 ? $u.timeFormat(item.duration * 1000, 'MM:ss') : '00: 00' }}</text>
              </view>

              <view class="div1">
                <u-icon name="clock" color=""></u-icon>
                <text>{{ item.duration > 0 ? $u.timeFormat(item.playedTime * 1000, 'MM:ss') : '00: 00' }}</text>
                <text class="stress-font played">已播{{ parseInt(String(item.playedTime * 100 / item.duration)) || '0' }}%</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

import Header from '@/components/header.vue'

//历史
@Component({name: 'myHistory', components:{ Header }})
export default class History extends Vue{
  private headerCmp = {
    leftUrl: '/pages/mine/index' as string,
    leftIcon: '' as string,
    title: '历史' as string, 
  }

  private list: any = [//接口数据组装后的列表
    { label: '', childList: [] },//今天
    { label: '', childList: [] },//昨天
    { label: '', childList: [] },//前天及以上
  ]

  mounted(){
    this.init()
  }

  init(){
    this.getHistoryList()
  }

  //获取历史清单列表
  getHistoryList(){
    this.buildList()
  }

  //播放
  play(id: number){
    uni.showToast({icon: 'none', title: '点击播放'})
  }

  // 打开更多
  open(content: string){
    uni.showToast({icon: 'none', title: '打开简介弹窗'})
    console.log('弹窗:',content)
  }

  //组装数组
  buildList(){
    let list = (uni as any).$u.deepClone(uni.getStorageSync(this.$Storage.keysObj.cacheList)) || []

    let date = new Date()
    let obj: any = {}
    let todayDate = {
      year: Number((uni as any).$u.timeFormat(new Date(), 'yyyy')),
      month: Number((uni as any).$u.timeFormat(new Date(), 'mm')),
      day: Number((uni as any).$u.timeFormat(new Date(), 'dd'))
    }
    list.map((item: any, index: number)=>{
      let itemDate = {
        year: Number((uni as any).$u.timeFormat(new Date(item.newPlayDate), 'yyyy')),
        month: Number((uni as any).$u.timeFormat(new Date(item.newPlayDate), 'mm')),
        day: Number((uni as any).$u.timeFormat(new Date(item.newPlayDate), 'dd'))
      }
      let oneDayTimes = 24 * 60 * 60 * 1000
      let differTimes = new Date().getTime() - new Date(item.newPlayDate).getTime()
      let differDay = differTimes / oneDayTimes
        
      //如果年月日与今天相同
      if(differDay <= 1){
        this.list[0].label = '今天'
        this.list[0].childList.push(item)
      }else if(differDay <= 2){
        this.list[1].label = '昨天'
        this.list[1].childList.push(item)
      }else if(differDay > 2){
        let snapDay = (uni as any).$u.timeFormat(new Date().getTime() - oneDayTimes * 2, 'mm-dd')
        this.list[2].label = snapDay + ' 更早'
        this.list[2].childList.push(item)
      }
    })
  }

  //播放
  toPlay(item: any){
    this.$store.commit('Play/setState', {state: 'albumId', value: item.albumId})
    this.$store.commit('Play/setState', {state: 'audioId', value: item.id})

    this.$store.commit('Play/setState', {state: 'isHistoryPlay', value: true})
    this.$store.commit('Play/setState', {state: 'current_time', value: item.playedTime})

    setTimeout(()=>{
      // #ifdef APP-PLUS
      this.$store.dispatch('Play/play')
      // #endif
      uni.switchTab({url: '/pages/play/index'})
    },500)
  }

  demo(){
    uni.showToast({title: '功能暂未实施:',icon: 'none'})
  }
}
</script>

<style lang="scss" scoped>
$width: 45rpx;

.card-box{
  margin: $header-margin-top $space-norm 0;
  padding-bottom: 50rpx;
  .card{
    .title{
      padding: 5rpx $space-block;
    }
    .item{
      display: flex;
      justify-content: space-between;
      margin-top: $space-block;
      padding: $space-block;
      .left{
        width: 20%;
        overflow: hidden;
      }
      .right{
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width: 77%;
        .pj{
          font-size: 28rpx;
          overflow: hidden;
          .div1{
            width: 70%;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            overflow: hidden;
          }
        }
        .pj2{
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 24rpx;
          .div1{
            display: flex;
            align-items: center;
             text:nth-last-child(1){
              margin-left: 20rpx;
            }
          }
        }
      }
    }
  }
}

::v-deep .u-count-down__text{
  color: inherit;
}

.weight{
  font-weight: bold;
}
</style>
