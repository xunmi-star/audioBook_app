<template>
  <view class="page" :class="[$changeColor('block-bcg')]" :style="$store.state.Seeting.initTheme">
    <Header :cmpData="headerCmp"></Header>
    <view class="card-box">
      <view class="title">
        <view class="left">
          <text class="weight">节目</text>
          <text>（{{list.length}}）</text>
        </view>
      </view>
      <!-- 筛选 -->
      <view class="selection" v-show="false">
        <view class="pj">
          <view class="but" :class="[item.flag?'act':'']" v-for="(item,index) in butList1" :key="index" @click="select(item,butList1)">{{item.label}}</view>
        </view>
        <view class="pj">
          <view class="but" :class="[item.flag?'act':'']" v-for="(item,index) in butList2" :key="index" @click="select(item,butList2)">{{`${item.label} ${item.number}`}}</view>
        </view>
      </view>
      <!-- 书籍 -->
      <view class="item" :class="[$changeColor('block-bcg2')]" v-for="(item,index) in list" :key="index">
        <view class="left">
          <u-image :src="$ossUrl + item.poster" width="150rpx" mode="widthFix"></u-image>
        </view>
        <navigator class="right" :url="`/pages/myListen/info?fromSollect=true&id=${item.id}`" redirect hover-class="className">
          <view class="pj">
            <view class="weight u-line-1">{{item.name}}</view>
            <view class="div12">作者：{{item.author}}</view>
            <view class="div12">{{item.title}}</view>
          </view>
          <view class="pj2 font-medium">
            <view class="div1 u-line-2">
              <text>简介：</text>
              <text>{{item.introduction}}</text>
            </view>
            <view class="div2">
              <text class="iconfont icon-genduo" @click="open(item.introduction)"></text>
            </view>
          </view>
        </navigator>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import {Vue, Component} from 'vue-property-decorator'

import Header from '@/components/header.vue'

//收藏
@Component({name: 'mySollect', components:{ Header }})
export default class Subscribe extends Vue{
  private headerCmp = {
    leftUrl: '/pages/mine/index' as string,
    leftIcon: '' as string,
    title: '收藏' as string, 
  }

  private list:object[] = [] 
  private butList1? = [
    {flag: true, label: '最近常听', state: 0},
    {flag: false, label: '最近更新', state: 1},
    {flag: false, label: '最近订阅', state: 2},
  ] as object[]
  private butList2? = [
    {flag: true, label: '全部', state: 0, number: 1},
    {flag: false, label: '完结', state: 1, number: 0},
    {flag: false, label: '连载中', state: 2, number: 1},
  ] as object[]
  private flags = {
    selection: false as Boolean,//筛选
    more: false as Boolean,//简介
  } as object

  mounted(){
    this.init()
  }

  init(){
    this.getCollectListt()
  }

  //获取收藏的专辑清单
  getCollectListt(){
    let params = {
      pageNum: 1,
      pageSize: 10,
    }
    this.$httpRequest.get(this.$httpApi.collectAlbumList, {params}).then((res: any)=>{
      this.list = res.rows
    })
  }

  //选中筛选里面的按钮
  select(item: any, arr: object[]){
    arr.map((res: any)=>{
      res.flag = false
    })
    item.flag = true

  }
   // 打开更多
  open(content: string){
    uni.showToast({icon: 'none', title: '打开简介弹窗'})
    console.log('弹窗:',content)
  }
}

</script>

<style lang="scss" scoped>
$width: 45rpx;

.card-box{
  margin: $header-margin-top 0 0;
  padding-bottom: 50rpx;
  overflow: hidden;
  .title{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10rpx $space-block;
    margin: 0 $space-block;
    .left{
      text:nth-child(1){
        font-size: 40rpx;
      }
    }
    .right{
      text:nth-child(1){
        font-size: 40rpx;
        margin-right: 10rpx;
      }
    }
  }
  .selection{
    margin: 0 $space-block;
    font-size: 24rpx;
    background: #3c3c3c;
    .pj{
      display: flex;
      align-items: center;
      background: #3c3c3c;
      .but{
        padding: 5rpx $space-block;
        background: #555;
        border-radius: 12rpx;
        margin: 10rpx;
      }
    }
  }
  .item{
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: $space-block $space-block 0;
      padding: $space-block;
      .left{
        width: 25%;
        overflow: hidden;
      }
      .right{
        position: relative;
        width: 73%;
        .pj{
          font-size: 28rpx;
          overflow: hidden;
          .div1{
            width: 70%;
            display: flex;
            justify-content: flex-start;
            overflow: hidden;
          }
          .div12{
            margin-top: 10rpx;
          }
        }
        .pj2{
          display: flex;
          align-items: center;
          justify-content: space-between;
          .icon-genduo{
            font-size: 50rpx;
          }
        }
      }
    }
}

.act{
  font-weight: bold;
  color: #d81e06;
}
.weight{
  font-weight: bold;
}
</style>
