<template>
  <view class="page" :class="[$changeColor('block-bcg')]" :style="$store.state.Seeting.initTheme">
    <view class="title-box weight">我的</view>
    
    <view class="account-box">
      <view class="info">
        <view class="left">
          <u-image :src="userInfo.avatar" shape="circle" width="120rpx" height="120rpx"></u-image>
        </view>
        <navigator class="right" url="/pages/mine/setting/user">
          <view class="pj">
            <view class="weight font-big">{{userInfo.nickName}}</view>
            <text class="iconfont icon-fanhui2"></text>
          </view>
        </navigator>
      </view>
    </view>

    <view class="nav-box" :class="[$changeColor('block-bcg2')]">
      <navigator class="pj" url="/pages/other/myDownload">
        <text class="iconfont icon-xiazai"></text>
        <text class="font-small">下载</text>
      </navigator>
      <navigator class="pj" url="/pages/other/myHistory">
        <text class="iconfont icon-lishi"></text>
        <text class="font-small">历史</text>
      </navigator>
      <navigator class="pj" url="/pages/other/mySollect">
        <text class="iconfont icon-shoucang"></text>
        <text class="font-small">收藏</text>
      </navigator>
    </view>

    <view class="notice-box" v-if="false">
      <u-image src="@/static/image/rank.png" width="100rpx" height="100rpx"></u-image>
      <text class="yellow">vip</text>
      <text class="remark">会员 0.54元一天 恢复全站免费听</text>
      <view class="but">立即开通</view>
    </view>

    <view class="menu-box" :class="[$changeColor('block-bcg2')]">
      <view class="item" @click="themeModal.show = true">
        <view class="name">{{$store.state.Seeting.theme.name==='dark'?'夜间模式':'日间模式'}}</view>
        <text class="iconfont icon-fanhui2"></text>
      </view>
      <navigator url="/pages/mine/feedBack" class="item" redirect hover-class="className">
        <view class="name">帮助反馈</view>
        <text class="iconfont icon-fanhui2"></text>
      </navigator>
      <view class="item" @click="clearModal.show = true">
        <view class="name">清空缓存</view>
        <text class="iconfont icon-fanhui2"></text>
      </view>
    </view>

    <view class="menu-box" :class="[$changeColor('block-bcg2')]">
      <navigator class="item" url="/pages/mine/placard/list">
        <view class="name">系统通知</view>
        <text class="iconfont icon-fanhui2"></text>
      </navigator>
      <navigator class="item" url="/pages/mine/placard/list">
        <view class="name">系统公告</view>
        <text class="iconfont icon-fanhui2"></text>
      </navigator>
      <view class="item" @click="checkVersion">
        <view class="name">检查版本</view>
        <text class="iconfont icon-fanhui2"></text>
      </view>
    </view>

    <view class="btn font-medium" @click="loginOutModal.show = true">
      <text>退出</text>
    </view>

    <!-- 遮罩 -->
    <u-overlay :show="overlayShow" :duration="400" :z-index ="999" :opacity="0.3"></u-overlay>
    
    <!--弹窗-检查版本 -->
    <u-modal :show="modal.show" :title="modal.title" :content="modal.content" :showCancelButton="true" @cancel="modal.show=false" @confirm="checkVersionInfo"></u-modal>
    <!-- 弹窗-切换主题 -->
    <u-modal :show="themeModal.show" :title="themeModal.title" :content="`切换为${$store.state.Seeting.theme.name==='dark'?'日间模式':'夜间模式'}`" :showCancelButton="true" @cancel="themeModal.show=false" @confirm="changeTheme"></u-modal>
    <!-- 弹窗-清空缓存 -->
    <u-modal :show="clearModal.show" :title="clearModal.title" :content="clearModal.content" :showCancelButton="true" @cancel="clearModal.show=false" @confirm="clear"></u-modal>
    <!-- 弹窗-退出登陆 -->
    <u-modal :show="loginOutModal.show" :title="loginOutModal.title" :content="loginOutModal.content" :showCancelButton="true" @cancel="loginOutModal.show=false" @confirm="loginOut"></u-modal>

  </view>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class Index extends Vue {
  private num: Number = 123 //对标之前的data函数返回的对象
  private versionInfo: any = {
    localVersion: 0,//本地app版本
    linkVersion: 0,//当前线上最新版本
    url: '',//下载链接
  }
  private overlayShow: boolean = false
  private modal = {
    show: false as boolean,
    title: '是否更新',
    content: '下载最新版本'
  }
  private themeModal = {
    show: false as boolean,
    title: '是否切换',
  }
  private clearModal = {
    show: false as boolean,
    title: '是否清空',
    content: '当前操作会清空下载队列'
  }
  private loginOutModal = {
    show: false as boolean,
    title: '确认退出',
    content: '确认退出系统'
  }
  private userInfo: any = {
    nickName: '游客', //昵称
    avatar: '/static/image/tx.png', //头像
  }

  onShow(){
    this.getInfo()
    this.getCurrentVersion()
  }

  //获取用户信息
  getInfo(){
    this.$httpRequest.get(this.$httpApi.getInfo).then((res: any)=>{
      this.userInfo.nickName = res.user.nickName
      if(res.user.avatar){
        this.userInfo.avatar = this.$ossUrl + res.user.avatar
      }
    })
  }

  //清空缓存
  clear(){
    this.$Storage.setStorage('PlayModule', 'downloadQueue', [])
    uni.showToast({title: '清理成功'})
    this.clearModal.show = false
  }

  //配置app版本
  getCurrentVersion(){
    this.$httpRequest.get(this.$httpApi.currentVersion).then((res: any)=>{
      this.versionInfo.linkVersion = res.data.version
      this.versionInfo.url = res.data.url
    })

    plus.runtime.getProperty(plus.runtime.appid, (info)=>{
      this.versionInfo.localVersion = info.version
    })
  }

  //切换主题
  changeTheme(){
    this.themeModal.show = false
    let theme: object = {//默认日间模式
      name: 'light',
      bcgColor: '#ffffff' as string,//主题背景色
      borderColor: 'rgba(0,0,0, 0.06)' as string,//边框颜色
      img: '~@/static/image/themeLight.webp',
      fontColor: 'rgba(0,0,0,1)',
    } 
    if(this.$store.state.Seeting.theme.name === 'light'){//切换为夜间模式
      theme = {
        name: 'dark',
        bcgColor: '#202020' as string,//主题背景色
        borderColor: 'rgba(255,255,255, 0.06)' as string,//边框颜色
        img: '~@/static/image/themeDark.webp',//主题图片
        fontColor: '#ffffff',//字体颜色
      }
    }
    this.$Storage.setStorage('SeetingModule', 'theme', theme)

    uni.showToast({title: '切换成功'})
    this.themeModal.show=false
  }

  //点击检查版本按钮
  checkVersion(){
    this.modal.show = true
    this.modal.content = `当前版本：v${this.versionInfo.localVersion}--正式版本：v${this.versionInfo.linkVersion}`
  }


  //更新版本
  checkVersionInfo(){
    uni.showToast({title: 'h5端下载app存在跨域问题，请在移动端下载', icon: 'none'})
    this.modal.show = false
    // #ifdef APP-PLUS
    this.downloadApp()
    this.overlayShow = true //开启遮罩
    // #endif

  }

  // 下载app
  downloadApp(){
    uni.showLoading({title: '正在更新APP，请耐心等待...'})
    uni.downloadFile({
      //执行下载
      url: process.env.VUE_APP_BASE_OSS + this.versionInfo.url,
      success: (res:any) => {
        console.log('下载成功:',res)
        //下载成功
        if (res.statusCode == 200) {
          uni.showLoading({title: '更新成功,安装后自动重启...'})
          setTimeout(() => {
            uni.hideLoading()
            plus.runtime.install(res.tempFilePath,{force: true},()=> {
                uni.showToast({title: '更新成功，重启中'})
                plus.runtime.restart()
              }
            );
          }, 5000);
        }
      },
      fail: (err: any)=>{
        console.log('更新失败:',err)
        this.overlayShow = false
        uni.hideLoading()
      }
    });
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
page{
  background: var(--bcgColor);
}

.page{
  padding-top: var(--status-bar-height);
}

.title-box{
  font-size: 48rpx;
  text-align: center;
  padding: $space-norm 0;
}

.account-box{
  margin: 0 $space-norm;
  border-radius: $border-small;
  .info{
    display: flex;
    align-items: center;
    width: 100%;
    .left{
      overflow: hidden;
    }
    .right{
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      flex: 8;
      margin-left: 54rpx;
      .pj{
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
  }
}

.nav-box{
  display: flex;
  align-content: center;
  justify-content: space-around;
  border-radius: $border-small;
  padding: 15rpx $space-block;
  margin: $space-norm;
  .pj{
    display: flex;
    flex-direction: column;
    text-align: center;
    .iconfont{
      font-size: 48rpx;
      margin-bottom: 5rpx;
    }
  }
}

.notice-box{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $space-norm;
  font-size: 24rpx;
  .but{
    padding: 5rpx 15rpx;
    color: rgba(245, 154, 35,1);
    border: 1px solid rgba(245, 154, 35,1);
    border-radius: $space-norm;
  }
}

.menu-box{
  margin: $space-norm;
  border-radius: $border-small;
  .item{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 40rpx 20rpx 20rpx 40rpx;
    font-weight: bold;
    font-size: 36rpx;
  }
}

.btn{
  margin: 114rpx $space-norm 50rpx;
}

.remark-box{
  width: 100%;
  font-weight: bold;
  font-size: 36rpx;
  margin-top: 60rpx;
  text-align: center;
  view{
    margin: $space-block 0;
  }
}

.yellow{
  color: rgba(244, 234, 42,1);
}
</style>
