<template>
	<view class="page" :class="[`theme-${$store.state.Seeting.theme.name}`]" :style="$store.state.Seeting.initTheme">
    <view class="main">
      <!-- logo图标 -->
      <view class="logo-box">
        <u-image src="/static/image/logo/logo.png" mode="widthFix"></u-image>
      </view>

      <!-- 表单信息 -->
      <view class="form-box font-small">
				<view class="item" :style="`borderBottom: 1px solid ${$changeBorderColor()}`">
					<view class="left">账号</view>
					<view class="right"><input type="text" maxlength="12" v-model="form.username" placeholder="请输入用户名"></view>
				</view>
				<view class="item" :style="`borderBottom: 1px solid ${$changeBorderColor()}`">
					<view class="left">密码</view>
					<view class="right"><input type="password" v-model="form.password" placeholder="密码不少于6位"></view>
				</view>
				<view class="item" :style="`borderBottom: 1px solid ${$changeBorderColor()}`" v-if="captchaOnOff">
					<view class="left">校验码</view>
					<view class="right">
            <input type="number" maxlength="6" v-model="form.code" placeholder="请输入校验码" @confirm="login">
            <view class="code-img">
              <u--image :src="codeImg" width="180rpx" height="80rpx" @click="getCode"></u--image>
            </view>
          </view>
				</view>
			</view>

       <!-- 提交按钮 -->
      <view class="btn font-medium" :class="[lock?'':'no-click']" @click="login">
        <text>登陆</text>
      </view>

      <view class="nav font-small">
        <navigator class="left" url="/pages/account/regist">
          <text>还没有账号?</text>
          <text >立即注册</text>
        </navigator>
        <view class="right" @click="changeSelect">
          <text class="iconfont" :class="[isRemember?'icon-yuanxingxuanzhong':'icon-yuanxingweixuanzhong']"></text>
          <text>记住密码</text>
        </view>
      </view>
    </view>
	</view>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import { UserModule } from '@/store/modules/user'

@Component({})
export default class Regist extends Vue {
  private lock: boolean = true
  private isRemember: boolean = false
  private form = {
    username: '' as string,
    password: '' as string,
    code: '' as number|string,
    uuid: '' as string,
  }
  private codeImg: string = ''
  private captchaOnOff: boolean = false //更具后台配置，决定是否需要输入验证码

  onLoad(){
    this.getStorage()
    this.getCode()
  }

  //获取缓存的账号，密码
  getStorage(){
    let storage = uni.getStorageSync(this.$Storage.keysObj.accountInfo)
    if(storage){
      this.isRemember = true
      this.form.username = storage.username
      this.form.password = storage.password
    }
  }

  //获取图片验证码
  getCode(){
    this.$httpRequest.get(this.$httpApi.captchaImage).then((res:any)=>{
      this.captchaOnOff = res.captchaOnOff
      if(res.captchaOnOff){
        this.form.uuid = res.uuid
        this.codeImg = 'data:image/jpeg;base64,' + res.img
      }
		})
  }

  //保持登陆
  changeSelect(){
    this.isRemember = !this.isRemember
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
    let arr = ['用户名','密码']
    if(this.captchaOnOff){
      arr = ['用户名','密码','校验码']
    }
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
          //用户保持登陆状态
          if(this.isRemember){
            uni.setStorageSync(this.$Storage.keysObj.accountInfo,{ username: this.form.username, password: this.form.password })
          }else{
            uni.setStorageSync(this.$Storage.keysObj.accountInfo,'')
          }
          uni.setStorageSync(this.$Storage.keysObj.userExpandInfo,res.data)
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
  padding-top: 100rpx;
  box-sizing: border-box;
}

.logo-box{
  display: flex;
  flex: 1;
  justify-content: center;
  margin: 50rpx 0 20rpx;  
  ::v-deep .u-image__image{
    width: 250rpx;
  }
}

.form-box{
  border-radius: 15rpx;
  padding: $space-norm;
  .item{
    display: flex;
    justify-content: flex-start;
    flex-direction: row;
    align-items: center;
    height: 80rpx;
    margin-bottom: 20rpx;
    .right{
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-left: 32rpx;
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

.nav{
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 30rpx;
  padding: 0 32rpx;
  .left{
    display: flex;
    justify-content: flex-end;
    margin-right: $space-norm;
    text:nth-last-child(1){
      color: $color-primary;
    }
  }
  .right{
    display: flex;
    align-items: center;
    justify-content: space-between;
    text:nth-child(2){
      margin-left: 10rpx;
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
