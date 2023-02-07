<template>
  <view class="page" :style="$store.state.Seeting.initTheme">
    <view class="theme-box">
      <image :src="`/static/image/${$store.state.Seeting.theme.name}.webp`" mode="" />
    </view>
    <Header :cmpData="headerCmp"></Header>
    <view class="main">
      <view class="menu-box" :class="[$changeColor('block-bcg')]">
        <view class="item">
          <view class="left">
            <u-icon name="minus-circle-fill" v-if="false"></u-icon>
            <view class="pj">
              <image src="/static/image/tx.png" mode="" />
              <view class="text">
                <view>寻觅</view>
                <text class="font-small">15972373704</text>
              </view>
            </view>
          </view>
          <view class="right">
            <u-icon name="checkbox-mark"></u-icon>
          </view>
        </view>
        <view class="item">
          <view class="left">
            <u-icon name="minus-circle-fill" v-if="false"></u-icon>
            <view class="pj">
              <image src="/static/image/tx.png" mode="" />
              <view class="text">
                <view>寻觅</view>
                <text class="font-small">15972373704</text>
              </view>
            </view>
          </view>
          <view class="right" v-if="false">
            <u-icon name="checkbox-mark"></u-icon>
          </view>
        </view>
        <navigator class="add-account" url="/pages/mine/accountManage/addAccount">
          <u-icon name="plus-circle"></u-icon>
          <text>添加或注册账号</text>
        </navigator>
      </view>

      <view class="loginout-box" :class="[$changeColor('block-bcg')]" @click="loginOutModal.show = true">
        <text>退出</text>
      </view>
    </view>

    <!-- 弹窗-退出登陆 -->
    <u-modal :show="loginOutModal.show" :title="loginOutModal.title" :content="loginOutModal.content" :showCancelButton="true" @cancel="loginOutModal.show=false" @confirm="loginOut"></u-modal>
  </view>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import Header from '@/components/header.vue'

@Component({name: 'AccountManage', components:{ Header }})
export default class AccountManage extends Vue{
  private headerCmp = {
    leftUrl: '/pages/mine/index' as string,
    leftIcon: '' as string,
    title: '账号管理' as string, 
  }
  private loginOutModal = {
    show: false as boolean,
    title: '确认退出',
    content: '确认退出系统'
  }


  //退出登陆-弹窗后的确认
  loginOut(){
    this.loginOutModal.show = false
		this.$httpRequest.get(this.$httpApi.logout).then((res:any)=>{
      this.$store.dispatch('User/logOut')
      uni.reLaunch({url: '/pages/account/login'})
		})
  }

}
</script>

<style lang="scss" scoped>
.main{
  margin-top: 100rpx;
  padding: $space-norm;
  box-sizing: border-box;
}
.menu-box{
  padding: $space-block 0;
  ::v-deep .u-icon__icon{
    font-size: 50rpx !important;
  }
  .item{
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid darken(#fff, 50);
    padding: $space-block;
    .left{
      display: flex;
      align-items: center;
      justify-content: space-between;
      ::v-deep .u-icon__icon{
        color: $color-error !important;
      }
      .pj{
        display: flex;
        align-items: center;
        image{
          width: 88rpx;
          height: 88rpx;
          border-radius: 50%;
        }
      }
      view:nth-child(2){
        margin-left: $space-block;
      }
    }
    .right{
      ::v-deep .u-icon__icon{
        color: $color-success !important;
      }
    }
  }
  .add-account{
    padding-top: $space-block;
    padding-left: $space-block;
    margin: $space-block 0;
    display: flex;
    align-items: center;
     ::v-deep .u-icon__icon{
        color: darken(#f4f5f7,10) !important;
        font-size: 88rpx !important;
        margin-right: $space-block;
      }
      text:nth-last-child(1){
        color: lighten($color-primary, 15);
      }
  }
}

.loginout-box{
  margin-top: $space-block;
  padding: $space-norm;
}
</style>