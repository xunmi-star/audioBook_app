<template>
	<view class="page" :style="$store.state.Seeting.initTheme">
    <view class="theme-box">
      <image :src="`/static/image/${$store.state.Seeting.theme.name}.webp`" mode="" />
    </view>
    <Header :cmpData="headerCmp"></Header>
    <view class="main">
      <!-- 标题 -->
      <view class="title-box weight">
        <text>添加账号</text>
      </view>

      <!-- 表单信息 -->
      <view class="form-box">
				<view class="item">
					<view class="left"><text class="star">*</text>用户名</view>
					<view class="right"><input type="text" maxlength="12" v-model="form.username" placeholder="请输入用户名"></view>
				</view>
				<view class="item">
					<view class="left"><text class="star">*</text>密码</view>
					<view class="right"><input type="password" v-model="form.password" placeholder="请输入密码"></view>
				</view>
				<view class="item">
					<view class="left"><text class="star">*</text>校验码</view>
					<view class="right">
            <input type="number" maxlength="6" v-model="form.code" placeholder="请输入校验码" @confirm="login">
            <view class="code-img">
              <u--image :src="codeImg" width="180rpx" height="80rpx" @click="getCode"></u--image>
            </view>
          </view>
				</view>
			</view>

       <!-- 提交按钮 -->
      <u-button type="primary" :class="[lock?'':'no-click']" @click="login" text="登陆"></u-button>

      <view class="nav">
        <navigator class="pj" url="/pages/account/regist">
          <text>还没有账号?</text>
          <text >立即注册</text>
        </navigator>
      </view>
    </view>
	</view>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import Header from '@/components/header.vue'

import { UserModule } from '@/store/modules/user'

@Component({name: 'AddAccount', components:{ Header }})
export default class addAccount extends Vue {
  private headerCmp = {
    leftUrl: '/pages/mine/accountManage/changeAccount' as string,
    leftIcon: '' as string,
    title: '' as string, 
  }
  private lock: boolean = true
  private form = {
    username: '' as string,
    password: '' as string,
    code: '' as number|string,
    uuid: '' as string,
  }
  private codeImg: string = ''

  onLoad(){
    this.getStorage()
    this.getCode()
  }

  //获取缓存的账号，密码
  getStorage(){
    let storage = uni.getStorageSync(this.$Storage.keysObj.accountInfo)
    if(storage){
      this.form.username = storage.username
      this.form.password = storage.password
    }
  }

  //获取图片验证码
  getCode(){
    this.$httpRequest.get(this.$httpApi.captchaImage).then((res:any)=>{
      this.form.uuid = res.uuid
      this.codeImg = 'data:image/jpeg;base64,' + res.img
		})
  }


  /**
   * 登陆包含3个接口
   * a、获取token
     b、获取用户基本信息
      c、获取用户扩展信息（获取不到则，新增扩展信息，直接霸屏）
    */
  login(){
    this.formCheck()
  }

  //form规则校验
  formCheck(){
    let arr = ['用户名','密码','校验码']
    let errMsg = this.$tool.hasEmpty(this.form, arr)
    if(errMsg){
      errMsg = errMsg + '不能为空'
      uni.showToast({title: errMsg, icon: 'none'})
      return
    }
    this.getToken()
  }


  //获取token
  getToken(){
    let parames = {
      url: this.$httpApi.getToken,
      data: this.form
    }
    this.$httpRequest.post(parames.url, parames.data).then((res:any)=>{
      UserModule.resetToken(res.token)
      this.getInfo()
      this.getAudienceUser()
    }).catch((err: any)=>{
      this.getCode()
    })
  }

  //获取用户信息
  getInfo(){
    this.$httpRequest.get(this.$httpApi.getInfo).then((res: any)=>{
      this.$Storage.setStorage('UserModule', 'userInfo', res.user)
    })
  }

  //获取用户拓展信息
  getAudienceUser(){
    if(this.lock){
      this.lock = false
      this.$httpRequest.get(this.$httpApi.getAudienceUser).then((res: any)=>{
        if(res.data){
          this.$Storage.setStorage('UserModule', 'userExpandInfo', res.data)

          uni.showToast({title: '登陆成功'})
          setTimeout(()=>{
            uni.switchTab({url: '/pages/home/index'})
          },1500)
        }else{
          this.addAudienceUser()
          this.getToken()
        }
      }).catch((err:any)=>{
        setTimeout(()=>{
          this.lock = true
          this.getCode()
        },1500)
      })
    }
  }

  //新增用户拓展信息
  addAudienceUser(){
    this.lock = true
    let url = this.$httpApi.addAudienceUser 
    let data = {
      userId: this.$store.state.User.userInfo.userId, //用户ID
      awardCurrency: 0, //当前积分
      userHobby: '1,2,3,4,5,6',// 喜好类型 
      memberLevel: '', //会员等级
      memberActiveTime: '' //会员失效时间
    }
    this.$httpRequest.post(url,data).then((res: any)=>{
      this.getAudienceUser()
    })
  }


}
</script>

<style lang="scss">
.main{
  box-sizing: border-box;
}

.title-box{
  padding: $space-norm;
  font-size: 40rpx;
}

.form-box{
  border-radius: 15rpx;
  padding: $space-norm;
  .item{
    display: flex;
    justify-content: flex-start;
    flex-direction: row;
    align-items: center;
    border-bottom: 2rpx solid #EFEFEF;
    height: 120rpx;
    .left{
      width: 25%;
    }
    .right{
      width: 75%;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .code{
        position: relative;
        .code-img{
          position: absolute;
          top: 0;
          right: 0;
        }
      }
    }
  }
}

.u-button{
  width: 80%;
  border-radius: 88rpx;
}

.nav{
  width: 100%;
  font-size: 26rpx;
  margin-top: 50rpx;
  .pj{
    display: flex;
    justify-content: flex-end;
    margin-right: $space-norm;
    text:nth-last-child(1){
      color: $color-primary;
    }
  }
}

.select{
  ::v-deep .u-radio__icon-wrap{
    background-color: rgba(41, 121, 255, 1) !important;
    border-color: rgba(41, 121, 255, 1) !important;
  }
}

</style>
