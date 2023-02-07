<template>
	<view class="page" :class="[`theme-${$store.state.Seeting.theme.name}`]" :style="$store.state.Seeting.initTheme">
    <Header :cmpData="headerCmp"></Header>		
    <view class="main">
      <!-- logo图标 -->
      <view class="logo-box">
        <u-image src="/static/image/logo/logo.png" mode="widthFix"></u-image>
      </view>

      <!-- 表单信息 -->
      <view class="form-box font-small">
				<view class="item" :style="`borderBottom: 1px solid ${$changeBorderColor()}`">
					<view class="left">账号</view>
					<view class="right"><input type="text" v-model="form.username" placeholder="请输入用户名"></view>
				</view>
				<view class="item" :style="`borderBottom: 1px solid ${$changeBorderColor()}`">
					<view class="left">密码</view>
					<view class="right"><input type="password" v-model="form.password" placeholder="密码不少于6位"></view>
				</view>
				<view class="item" :style="`borderBottom: 1px solid ${$changeBorderColor()}`">
					<view class="left">确认密码</view>
					<view class="right"><input type="password" v-model="form.confirmPassword" placeholder="请确认密码"></view>
				</view>
				<view class="item" :style="`borderBottom: 1px solid ${$changeBorderColor()}`" v-if="captchaOnOff">
					<view class="left">校验码</view>
					<view class="right">
            <input type="number" maxlength="6" v-model="form.code" placeholder="请输入校验码">
            <view class="code-img">
              <u--image :src="codeImg" width="180rpx" height="80rpx" @click="getCode"></u--image>
            </view>
          </view>
				</view>
			</view>

      <!-- 提交按钮 -->
      <view class="btn font-medium" :class="[lock?'':'no-click']" @click="formCheck">
        <text>立即注册</text>
      </view>
    </view>
	</view>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Header from '@/components/header.vue'

@Component({name: 'Regist', components: {Header}})
export default class Regist extends Vue {
  private headerCmp = {
    leftUrl: '/pages/account/login' as string,
    leftIcon: '' as string,
    title: '注册' as string, 
  }
  private lock: boolean = true
  private captchaOnOff: boolean = false //是否需要输入验证码
  private form = {
    username: '' as string,
    password: '' as string,
    confirmPassword: '' as string,
    code: '' as number|string,
    uuid: '' as string,
    roleKey: 'audience' as string,
  }
  private codeImg: string = ''

  onLoad(){
    this.getCode()
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

  formCheck(){
    let arr = ['用户名','密码','确认密码']
    if(this.captchaOnOff){
      arr = ['用户名','密码','确认密码','校验码']
    }
    let errMsg = this.$tool.hasEmpty(this.form, arr)
    if(errMsg){
      errMsg = errMsg + '不能为空'
      uni.showToast({title: errMsg, icon: 'none'})
      return
    }
    this.submit()
  }

  //提交
  submit(){
    let parames = {
      url: this.$httpApi.register,
      data: this.form
    }
    if(this.lock){
      this.lock = false
      this.$httpRequest.post(parames.url, parames.data).then((res:any)=>{
        uni.showToast({title: res.msg})
        setTimeout(()=>{
          uni.redirectTo({url: '/pages/account/login'})
        },1500)
      }).catch((err:any)=>{
        this.getCode()
        uni.showToast({title: err.msg, icon: 'none'})
        setTimeout(()=>{
          this.lock = true
        },1500)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.main{
  padding-top: $header-margin-top;
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

</style>
