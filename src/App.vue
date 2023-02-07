<script lang="ts">
import Vue from 'vue'
import { Watch } from 'vue-property-decorator'

import storage from '@/utils/storage'
import {initDtask} from '@/utils/plusDownload'

import { PlayModule } from '@/store/modules/play'
import { UserModule } from '@/store/modules/user'
import { SeetingModule } from '@/store/modules/seeting'

/**
 * 点击通知栏跳转 开始
 */
// #ifdef APP-PLUS
const main = plus.android.runtimeMainActivity()

// #endif
/**
 * 点击通知栏跳转 结束
 */

export default Vue.extend({
  mpType: 'app',
  onLaunch() {
    //配置主题
    let theme = uni.getStorageSync(this.$Storage.keysObj.theme)
    console.log('配置主题:',theme)
    if(theme){
      this.$Storage.setStorage('SeetingModule', 'theme', theme)
    }
    SeetingModule.changeTheme()


    this.getCacheList()
    UserModule.resetToken(uni.getStorageSync(this.$Storage.keysObj.token))

    PlayModule.initAudio()     //加载音频播放器

    //枚举任务初始化
    initDtask()

    // 继续下载
    this.keepOnDownload()
  },
  onShow() {
    // #ifdef APP-PLUS
    // 点击通知栏跳转
    const intent = plus.android.invoke(main, 'getIntent')
    const path = plus.android.invoke(intent, 'getStringExtra', 'path') // list 里面的 path
    // #endif
  },
  onHide() {},
  methods: {
    //把从缓存读取的最新音频设为默认音频
    getCacheList(){
      let list = uni.getStorageSync(this.$Storage?.keysObj.cacheList)
      if(Array.isArray(list)){
        if(list[0]){
          let defaultAudio: any = list[0]
          PlayModule.setState({state: 'audioId', value: defaultAudio.id})
          PlayModule.setState({state: 'audioInfo', value: defaultAudio})
          PlayModule.setState({state: 'albumId', value: defaultAudio.albumId})
        }
      }
    },

    /**
     * 配置状态栏背景模式
     */
    setStatusBarStyle(name: string){
      // #ifdef APP-PLUS
      setTimeout(()=>{
        return plus.navigator.setStatusBarStyle(name)   
      },500)
      // #endif
    },

    //继续未完成的下载
    keepOnDownload(){
      let isKeepOn = false  

      let downloadQueue = uni.getStorageSync(this.$Storage.keysObj.downloadQueue) || []
      storage.setStorage('PlayModule', 'downloadQueue', downloadQueue) 

      console.log('首页检测下载队列:',PlayModule.downloadQueue)
      downloadQueue.map((item: any)=>{
        if(item && item.audioList){
          if(item.audioList.length>0){
            isKeepOn = true
          }
        }
      })
      if(isKeepOn){
        uni.showModal({
          title: '提示',
          content: '检测到有正在下载的音频，是否继续下载？',
          success: function (res) {
            if (res.confirm) {
              PlayModule.runDownloadQueue({})
              uni.navigateTo({url: '/pages/other/downloading'})
            } else if (res.cancel) {
              console.log('用户点击取消');
            }
          }
        });
      }
    }
  },

  onError(e){
    console.log('bing-onError',e)
  },

  watch: {
    //监听专辑id的变化
    '$store.state.Play.albumId': function(newVal: number){
      console.log('专辑变化:',newVal, this.$store.state.Play.albumInfo.name)
    },

    //控制tabbar的显示与隐藏
    '$store.state.Seeting.showTabbar': function(newVal: boolean){
      console.log('newVal:',newVal)
      if(newVal){
        uni.showTabBar()
      }else{
        uni.hideTabBar()
      }
    },

    //控制tabbar的背景颜色
    '$store.state.Seeting.theme': {
      deep: true,
      handler: function(newObj: any){
        console.log('控制tabbar的背景颜色:',newObj)
        if(newObj){
          SeetingModule.changeTheme()
          let obj = {
            color: newObj.fontColor,//未选中时的文字颜色
            // selectedColor: newObj.bcgColor, //选中后的文字颜色
            backgroundColor: newObj.bcgColor //背景色
          }
          uni.setTabBarStyle(obj)
          this.setStatusBarStyle(newObj.name || 'dark')
        }
      }
    }
  }
})
</script>

<style lang="scss">
/*每个页面公共css */

/*引入uView基础样式 */
@import 'uview-ui/index.scss';
.u-icon{
  display: inline-block !important;
}

/** 引入iconfont图标 */
@import './static/css/iconfont/iconfont.css';

page{
  font-size: $space-norm;
  letter-spacing: 0;/*字间距*/
  word-wrap: break-word;/*允许在长单词或 URL 地址内部进行换行*/
}

.page{
  min-height: 100vh;
}

/* 浏览器自动填充样式修改 */
input:-webkit-autofill { 
    box-shadow: 0 0 0px 1000px white inset !important; 
}

.uni-input-input:-webkit-autofill { 
    box-shadow: 0 0 0px 1000px white inset !important; 
}

.u-icon__icon{
  color: inherit !important;
}

/* 设置背景图片 */
.theme-box{
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
}
.theme-box uni-image{
  min-height: 100vh;
  width: 100vw;
}


.star{
  color: #dd524d;
}

.weight{
  font-weight: bold;
}

.theme-light{
  background: $theme-bcg-light;
}
.theme-dark{
  background: $theme-bcg-dark;
}

/* 跟随主题的背景 */
.light-bcg{
  background: $theme-light;
}
.dark-bcg{
  background: $theme-dark;
}

/* 跟随主题的块级背景 */
.light-block-bcg{
  background: #f6f6f8;
}
.dark-block-bcg{
  background: #121212;
}

/* 跟随主题的字体颜色 */
.light-block-font{
  color: #666666;
}
.light-block-font2{
 color: #999999;
}
.dark-block-font{
  color: rgba(255,255,255,0.87);
}
.dark-block-font2{
  color: rgba(255,255,255,0.60);
}

/* 跟随主题的块级背景高亮 */
.light-block-bcg2{
  background: #ffffff;
}
.light-block-bcg3{
  background: rgba(0, 0, 0, 0.10);
}
.dark-block-bcg2{
  background: #202020;
}
.dark-block-bcg3{
  background: rgba(255,255,255,0.12);;
}

// 按钮，重点文本的字体颜色(强调色)
.stress-font{
  color: $stress-font;
}
.stress-font2{
  color: $stress-font2;
}
.stress-bcg{
  background: $stress-bcg;
}

/* 不允许按钮点击 */
.no-click{
	background: #999999 !important;
}


.btn{
  width: 90%;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  margin: auto;
  margin-top: 50rpx;
  border-radius: 102rpx;
  background: linear-gradient(168deg, #F9D57A 0%, #EE9D34 100%);
  color: #fff;
}

/* 按钮组 */
.u-button--primary{
  background: lighten($color-primary, 10) !important;
  border-color: lighten($color-primary, 10) !important;
}

/* 字体大小 */
.font-mine{
  font-size: $font-mine;
}
.font-small{
  font-size: $font-small;
}
.font-medium{
  font-size: $font-medium;
}
.font-big{
  font-size: $font-big;
}
.font-extra{
  font-size: $font-extra;
}

//占位字符字体大小
.uni-input-placeholder{
  font-size: $font-mine;
}

</style>
