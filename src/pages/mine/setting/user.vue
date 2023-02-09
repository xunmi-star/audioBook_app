<template>
	<view class="page" :style="$store.state.Seeting.initTheme">
    <view class="theme-box">
      <image :src="`/static/image/${$store.state.Seeting.theme.name}.webp`" mode="" />
    </view>
    <Header :cmpData="headerCmp"></Header>		
    <view class="main">
      <view class="form-box">
				<view class="formItem" @click="upload">
					<view class="title">头像</view>
					<view class="right">
						<image class="avatar" :src="avatar" mode=""></image>
            <text class="iconfont icon-fanhui2"></text>
					</view>
				</view>
				<view class="formItem">
					<view class="title">昵称</view>
					<view><input type="text" v-model="form.nickName" placeholder="请输入昵称"></view>
				</view>
				<view class="formItem">
					<view class="title">邮箱</view>
					<view><input type="text" v-model="form.email" placeholder="请输入邮箱"></view>
				</view>
        <view class="remind font-small" v-show="!checkEmail">邮箱格式不正确</view>
				<view class="formItem">
					<view class="title">手机号</view>
					<view><input type="text" v-model="form.phonenumber" placeholder="请输入手机号"></view>
				</view>
        <view class="remind font-small" v-show="!checkPhone">手机号格式不正确</view>
				<view class="formItem" @click="pickSex.show = true">
					<view class="title">性别</view>
					<view>{{ initSex }}</view>
				</view>
				<view class="formItem">
					<view class="title">密码</view>
					<view><input type="password" v-model="form.password" placeholder="请输入登录密码"></view>
				</view>
			</view>
		</view>
    <view class="btn-box">
      <u-button type="primary" text="保存"  @click="modal.show = true"></u-button>
    </view>

    <!-- 性别选择 -->
    <u-picker :show="pickSex.show" :columns="pickSex.columns" keyName="label" @cancel="pickSex.show = false" @confirm="confirm"></u-picker>
    <!-- 弹窗确认 -->
    <u-modal :show="modal.show" :title="modal.title" :content="modal.content" :showCancelButton="true" @confirm="submit" @cancel="modal.show=false"></u-modal>

	</view>
</template>

<script lang="ts">
import {Vue, Component, Watch} from 'vue-property-decorator'
import Header from '@/components/header.vue'

@Component({name: 'SettingUser', components:{ Header }})
export default class SettingUser extends Vue{ 
  private headerCmp = {
    leftUrl: '/pages/mine/index' as string,
    leftIcon: '' as string,
    title: '个人中心' as string, 
  }
  private hasChooseImage: boolean = false //有从本地获取到图片
  private avatar: any = '/static/image/tx.png'
  private form: any = {
    nickName : "游客" as string, //用户昵称
    email: '' as string,//用户邮箱
    phonenumber: '' as string,//用户手机号
    sex: 2 as Number,//用户性别,默认保密
    password: '' as string//密码
  }
  //性别选择
  private pickSex = {
    show: false as boolean,
    columns: [
        [{label: '女',value: 0},{label: '男',value: 1},{label: '保密',value: 2}]
    ] as any,
  }
  //确认操作
  private modal = {
    show: false as boolean,
    title: '操作更改' as string,
    content: '点击确定后您的信息会立即更改' as string
  }

  //计算属性
  get checkEmail(): boolean {
    let flag = true
    if(this.form.email){
      let checkFlag = (uni as any).$u.test.email(this.form.email)
      if(!checkFlag){
        flag = false
      }
    }
    //用户没有输入或输入了正确的邮箱才允许提交
    return flag
  }

  get checkPhone(): boolean {
    let flag = true
    if(this.form.phonenumber){
      let checkFlag = (uni as any).$u.test.mobile(this.form.phonenumber)
      if(!checkFlag){
        flag = false
      }
    }
    //用户没有输入或输入了正确的手机号才允许提交
    return flag
  }

  get initSex(): string {
    let arr = ['女','男','保密']
    return arr[this.form.sex]
  }


  onLoad(){
    this.init()
  }

  init(){
    uni.hideLoading()
    this.hasChooseImage = false
    this.getInfo();
  }

  getInfo(){
    this.$httpRequest.get(this.$httpApi.getInfo).then((res: any)=>{
      this.form.nickName = res.user.nickName
      this.form.email = res.user.email
      this.form.phonenumber = res.user.phonenumber
      this.form.sex = Number(res.user.sex)
      if(res.user.avatar){
        this.avatar = this.$ossUrl + res.user.avatar
      }

      let accountInfo = uni.getStorageSync(this.$Storage.keysObj.accountInfo)
      if(accountInfo){
        this.form.password = accountInfo.password
      }
    })
  }

  //选择性别后的确定
  confirm(obj: any){
    this.form.sex = obj.value[0].value
    this.pickSex.show = false
  }

  //从本地获取图片
  upload(){
    uni.chooseImage({
      count: 1, //默认9
      sourceType: ['album'], //从相册选择
      success: (data)=> {
        this.avatar = data.tempFilePaths[0]
        this.hasChooseImage = true
      }
    })
  }


  submit(){
    this.modal.show = false
    this.changeUserInfo()
  }

  //修改用户信息
  changeUserInfo(){
    this.$httpRequest.post(this.$httpApi.updateUserInfo, this.form).then((res:any)=>{
      uni.showLoading({title: '加载中...',mask: false})
      if(this.hasChooseImage){
        this.upLoadImg().then(()=>{
          this.init()
        })
      }else{
        this.init()
      }
		})
  }

  //上传图片
  upLoadImg(){
    return new Promise((resolve: any, reject: any)=>{
      let postData = {
        name: 'file', // 文件对应的 key , 开发者在服务器端通过这个 key 可以获取到文件二进制内容
        filePath: this.avatar, // 要上传文件资源的路径。
      }
      this.$httpRequest.upload(this.$httpApi.updateUserAvatar,postData).then(()=>{
        resolve('图片上传成功')
      })
    })
  }
}
</script>

<style lang="scss" scoped>
.main{
  padding: $space-norm;
  box-sizing: border-box;
}
.form-box{
  border-radius: 15rpx;
  margin-bottom: 100rpx;
  .formItem{
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    align-items: center;
    border-bottom: 2rpx solid #EFEFEF;
    height: 120rpx;
    .right{
      display: flex;
      flex-direction: row;
      align-items: center;
    }
    .avatar{
      width: 80rpx;
      height: 80rpx;
      margin-right: 12rpx;
    }
    .next{
      width: 42rpx;
      height: 42rpx;
    }
    input{
      text-align: right;
    }
  }
  .remind{
    width: 100%;
    text-align: right;
    color: $uni-color-error;
  }
}

.u-button{
  width: 80%;
  border-radius: 88rpx;
}
.btn-box{
  width: 100%;
}
</style>
