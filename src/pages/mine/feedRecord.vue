<template>
  <view class="page" :class="[$changeColor('block-bcg')]" :style="$store.state.Seeting.initTheme">
    <Header :cmpData="headerCmp"></Header>
    <div class="search-box" :class="[$changeColor('block-bcg3')]">
       <u-search :clearabled="false" :show-action="false" v-model="form.keyWord" @clickIcon="clickIcon" bg-color="transparent" color="#909399" placeholder="请输入关键字"></u-search>
     </div>

    <view class="main-box">
      <view class="item" :class="[$changeColor('block-bcg2')]" v-for="(item,index) in list" :key="index">
        <view class="pj">
          <text class="title">标题:{{item.title}}</text>
        </view>
        <view class="pj">
          <text class="text">内容:{{item.content}}</text>
        </view>
        <view class="pj footer font-small">
          <text>{{item.emil}}</text>
          <text>{{item.createTime}}</text>
        </view>
      </view>
    </view>
   
  </view>
</template>

<script lang="ts">
import {Vue, Component, Watch} from 'vue-property-decorator'

import Header from '@/components/header.vue'

@Component({name: 'Feedback', components:{ Header }})
export default class Feedback extends Vue{ 
  private headerCmp = {
    leftUrl: '/pages/mine/feedBack' as string,
    title: '反馈记录' as string, 
  }
  private list: object[] = []
  private form = {
		keyWord: '' as string, // 关键字
		page: 1 as number, //页码
		pageSize: 5 as number, //每一页的数据长度
	}

  onLoad(pass: string){
    console.log('pass:',pass)
    this.init()
  }

  init(){
    this.getFeedRecord()
  }

  getFeedRecord(){
    let params = {
      title: this.form.keyWord
    }
    this.$httpRequest.get(this.$httpApi.myFeedbackList, {params}).then((res:any)=>{
      this.list = res.data
		})
  }

  // 点击搜索框的图标
	clickIcon(){
		console.log('点击搜索框的图标')
		this.init()
	}


}

</script>

<style lang="scss" scoped>
.page{
  padding-top: 5rpx;
}
.search-box{
	margin: $space-block $space-block 0;
  margin-top: 130rpx;
	border-radius: 16rpx;
	::v-deep .u-search__content{
		flex-direction: row-reverse;
	}
}

.main-box{
  margin: $space-block;
  .item{
    padding: $space-block;
    margin-bottom: $space-block;
    .pj{
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 5rpx;
      .title{
        color: $color-error;
      }
      .text{
        margin: 10rpx 0;
      }
    }
  }
}


</style>
