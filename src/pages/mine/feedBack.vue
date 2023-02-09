<template>
  <view class="page" :class="[$changeColor('block-bcg')]" :style="$store.state.Seeting.initTheme">
    <Header :cmpData="headerCmp"></Header>
    <view class="head-box">
      您的反馈是逍遥前进的动力，谢谢！
    </view>

    <view class="content-box" :class="[$changeColor('block-bcg2')]">
      <input type="text" v-model="form.title" placeholder="请输入标题,例：登陆界面太丑">
    </view>

    <view class="rich-box" :class="[$changeColor('block-bcg2')]"> 
      <textarea name="" cols="30" rows="10" maxlength="200" :placeholder="rich.placeholder" v-model="form.content"></textarea>
    </view>

    <view class="content-box" :class="[$changeColor('block-bcg2')]">
      <input type="text" v-model="form.emil" placeholder="留下联系方式，更可能解决问题~">
    </view>

    <view class="btn font-medium" @click="submit">
      <text>提交</text>
    </view>

    <view class="remark-box font-small">
      如果你能提供有声书资源，欢迎你发送邮件到carefreeaudiobook@qq.com联系我们！
    </view>
  </view>
</template>

<script lang="ts">
import {Vue, Component, Watch} from 'vue-property-decorator'

import Header from '@/components/header.vue'

@Component({name: 'Feedback', components:{ Header }})
export default class Feedback extends Vue{ 
  private headerCmp = {
    leftUrl: '/pages/mine/index' as string,
    leftIcon: '' as string,
    title: '帮助与反馈' as string, 
    subtitle: '反馈记录',
    rightUrl: '/pages/mine/feedRecord' as string,
    rightIcon: '' as string,
  }

  private rich = {
    placeholder: '非常感谢您的反馈，详细的描述更有助于解决问题，收到反馈后我们会尽快解决',
  }
  private form = {
    title: '',
    content: '',
    emil: '',
  }

  onLoad(){
    this.init()
  }

  init(){

  }

  submit(){
    let errMsg = ''
    if(!this.form.title){ errMsg = '反馈标题不能为空' }
    if(!this.form.content){ errMsg = '反馈内容不能为空' }
    if(!this.form.emil){ errMsg = '邮箱不能为空' }
  
    let isEmil = (uni as any).$u.test.email(this.form.emil)
    if(!isEmil){
      errMsg = '邮箱格式不正确'
    }
    if(errMsg){
      uni.showToast({title: errMsg, icon: 'none'})
      return
    }

    this.headerCmp.rightUrl = `/pages/mine/feedRecord?title=${this.form.title}`

    let parames = {
      url: this.$httpApi.addFeedBack,
      data: this.form
    }
    this.$httpRequest.post(parames.url, parames.data).then((res:any)=>{
      uni.showToast({title: res.msg})
		})
  }


}

</script>

<style lang="scss" scoped>
.head-box{
  margin: 0 $space-norm $space-norm;
}

.rich-box{
  margin:  0 $space-norm;
  padding: $space-block;
  border: 1px solid rgba(255,255,255,0.5);
  textarea{
    width: 100%;
    height: 200rpx;
  }
}

.content-box{
  margin: $space-norm;
  input{
    padding: $space-block;
    border: 1px solid rgba(255,255,255,0.5);
  }
}

.submit{
  width: 80%;
  margin: 50rpx auto;
  text-align: center;
  .u-button{
    border-radius: 88rpx;
  }
}


.remark-box{
  margin: 0 $space-norm;
  margin-top: 30rpx;
  text-align: center;
}
</style>
