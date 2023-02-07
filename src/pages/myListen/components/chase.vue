<template>
  <view class="cmp">
    <view class="card-box">
      <view class="card" :class="[$changeColor('block-bcg2')]" v-for="(item,index) in list" :key="index" @click="toPlay(item)">
        <view class="top">
          <view class="pj u-line-1 font-mine">
            <text>简介：{{ item.introduction }}</text>
          </view>
        </view>
        <view class="bottom">
          <view class="left">
            <view class="pj weight">
              <text>{{ item.title }}</text>
              <text>{{ item.name }}</text>
            </view>
            <view class="pj font-mine" :class="[$changeColor('block-font')]">
              <text>收听到{{ ` ${$u.timeFormat(item.playedTime*1000, 'MM:ss')}/${$u.timeFormat(item.duration*1000, 'MM:ss')}` }} </text>
              <text>已播放{{ parseFloat(item.playedTime / item.duration * 100).toFixed(0) }}%</text>
            </view>
          </view>
          <view class="right">
            <u-image :src="item.poster" mode="widthFix"></u-image>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

//追更
@Component({name: 'chase', components:{}})
export default class Chase extends Vue{
  private list: any = []

  mounted(){
    this.init()
  }

  init(){
    this.list = []

    this.getFollowUpList()
  }

  //获取追更列表
  getFollowUpList(){
    let cacheList = uni.getStorageSync('cacheList') || []

    let params = {
      pageNum: 1,
      pageSize: 10,
    }
    this.$httpRequest.get(this.$httpApi.followUpList, {params}).then((res: any)=>{
      let list = res.rows || []
      list.map((item: any)=>{
        cacheList.map((cacheItem: any)=>{
          if(item.audioId == cacheItem.id){
            item = cacheItem
            this.list.push(cacheItem)
          }
        })
      })
    })
  }

  //播放
  toPlay(data: any){
    this.followUpRead(data.albumId)
    this.$store.commit('Play/setState', {state: 'albumId', value: data.albumId})
    this.$store.commit('Play/setState', {state: 'audioId', value: data.id})

    //更具当前进度继续播放
    this.$store.commit('Play/setState', {state: 'isHistoryPlay', value: true})
    this.$store.commit('Play/setState', {state: 'current_time', value: data.playedTime})
    setTimeout(()=>{
      // #ifdef APP-PLUS
      this.$store.dispatch('Play/play')
      // #endif
      uni.switchTab({url: '/pages/play/index'})
    },500)
  }

  //追更改为已读
  followUpRead(id: number){
    let params = {
      followupId: id
    }
    this.$httpRequest.get(this.$httpApi.followUpRead, {params}).then((res: any)=>{
     console.log('追更状态设为已读：',res)
    })
  }
}
</script>

<style lang="scss" scoped>
.cmp{
  padding: $space-norm $space-norm 0;
}

.card-box{
  margin-top: 100rpx;
  .card{
    border-radius: 16rpx;
    margin-top: $space-block;
    padding: 0 $space-norm;
    height: 244rpx;
    .top{
      padding-top: 60rpx;
      width: 42%;
    }
    .bottom{
      display: flex;
      justify-content: space-between;
      margin-top: $space-norm;
      .left{  
        .pj:nth-child(1){
          text{
            margin-right: $space-block;
          }
        }
        .pj:nth-child(2){
          margin-top: 10rpx;
          text{
            margin-right: $space-norm;
          }
        }
      }
      .right{
        width: 120rpx;
        height: 120rpx;
        border-radius: 16rpx;
        margin-top: -40rpx;
        overflow: hidden;
        ::v-deep .u-image__image{
          width: 120rpx;
        }
      }
    }
  }
}

.weight{
  font-weight: bold;
}
</style>
