<template>
  <view class="cmp">
    <div class="search-box">
       <u-search :clearabled="false" :show-action="false" v-model="form.keyword" @clickIcon="clickIcon" color="#909399" bg-color="#555555" placeholder="请输入关键字"></u-search>
     </div>
    <view class="vip-box">
      <view class="left">
        <view class="img"><image src="@/static/image/tx.png" mode="widthFix" /></view>
        <view class="content">
          <view class="name">尊敬的VIP会员</view>
          <view class="remark">2021-11-04到期</view>
        </view>
      </view>
      <view class="right">
        <button class="but" size="medium">续费</button>
      </view>
    </view>
    <view class="soon-box">
      <view class="head-content">
        <view class="left">最近在听</view>
        <view class="right">更多<u-icon name="arrow-right" color=""></u-icon></view>
      </view>
      <view class="card">
        <view class="top">
          <view class="img"><image src="@/static/image/book.jpg" mode="widthFix" /></view>
          <view class="content">
            <view class="title u-line-1">将夜(同名热播影视剧原著)</view>
            <view class="listen u-line-1">将夜 第923集 幸福的尾声（欢迎订阅叶听xxxxxxxxxx</view>
          </view>
        </view>
        <view class="footer">
          <text>已完更</text>
          <text>已收听至第1集</text>
        </view>
      </view>
    </view>
    <view class="book-box">
      <view class="head-content2">
        <view class="title small-radius">猜你喜欢</view>
        <view class="content">
          <view class="remark small-radius">听点爱听的</view>
          <view class="right small-radius">更多<u-icon name="arrow-right" color=""></u-icon></view>
        </view>
      </view>
      <Books></Books>  
    </view>
  </view>
</template>

<script lang="ts">
import Books from '@/components/books.vue'

import { Component, Vue, Watch } from 'vue-property-decorator'

@Component({name: 'Vip', components: { Books }})
export default class Vip extends Vue{
  private form = {
			pageNum: 1 as number, // 分页参数，第几页
			pageSize: 10 as number, // 分页参数， 一页几条
			keyWord: '' as string, // 关键字
	}


  // 点击搜索框的图标
	clickIcon(){
		console.log('点击搜索框的图标')
	}
}
</script>

<style lang="scss" scoped>
.cmp{
	margin-top: $space-norm;
	& > view{
		margin-top: $space-norm;
	}
}

::v-deep .u-search__content{
	flex-direction: row-reverse;
}

.vip-box{
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 220rpx;
  padding: $space-block;
  border-radius: $uni-radius-box;
  background: $uni-bck-content;
  .left{
    display: flex;
    align-items: center;
    image{
      width: 120rpx;
    }
    .content{
      margin-left: $space-block;
      color: #ffff80;
      .name{
        font-size: 36rpx;
      }
      .remark{
        font-size: 24rpx;
      }
    }
  }
  .but{
    width: 180rpx;
    height: 60rpx;
    line-height: 60rpx;
    border-radius: $space-block;
    color: #ffffff;
    font-size: $space-norm;
    background: #facd91;
  } 
}

.soon-box{
  .head-content{
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 24rpx;
  }
  .card{
    padding: $space-block;
    margin-top: 8rpx;
    border-radius: $uni-radius-box;
    background: $uni-bck-content;
    .top{
      display: flex;
      align-items: center;
      overflow: hidden;
      image{
        width: 140rpx;
      }
      .content{
        overflow: hidden;
        margin-left: 15rpx;
        margin-right: 15rpx;
        .title{
          margin-bottom: $space-block;
        }
      }
    }
    .footer{
      margin-left: $space-block;
      & > :nth-child(1){
        color: #caf982;
      }
      & > :nth-child(2){
        margin-left: $space-block;
        color: #aaaaaa;
      }
    }
  }
}

.book-box{
  border-radius: $uni-radius-box;
  background: $uni-bck-content;
  .head-content2{
    padding: $space-block 40rpx;
    .title{
      width: 5em;
      font-size: $space-norm;
    }
    .content{
      display: flex;
      align-items: center;
      margin-top: 10rpx;
      justify-content: space-between;
      font-size: 28rpx;
      .remark{
        color: #facd91;
        width: 6em;
      }
      .right{
        width: 3.5em;
        // display: flex;
      }
    }
  }
}

.small-radius{
  padding: 5rpx;
  text-align: center;
  border-radius: 10rpx;
  background: $uni-theme-night-color;
}
</style>
