<template>
  <view class="cmp">
    <view class="main-box">
      <view class="left">
        <text>查看评论</text>
      </view>
      <view class="right"></view>
    </view>
  </view>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'

import { SeetingModule } from '@/store/modules/seeting'

@Component({name: 'WriteDiscuss'})
export default class WriteDiscuss extends Vue{
  @Prop ({type: Object,default:()=>({
    parentId: null,
  })}) cmpData?: any

  private show: boolean = true
  private checkboxValue1: any = []

  private sendContent: string = ''

  private checkbox = {
    flag: true as boolean,
  }

  //发表评论
  sendComment(){
    let parames = {
      url: this.$httpApi.audioComment,
      data: { 
        parentId: this.cmpData.parentId,
        audioId: this.$store.state.Play.audioId,
        content: this.sendContent 
      }
    }
    this.$httpRequest.post(parames.url, parames.data).then((res: any)=>{
      uni.showToast({title: res.msg})
    })
    this.sendContent = ''
    this.close()
    this.$emit('paramesSon',{show: false})
  }

  //同步到动态
  checkboxChange(flag: boolean){
    this.checkbox.flag = flag
    if(this.checkbox.flag === true){
      console.log('点击同步')
    }
  }

  //modal关闭事件,点击遮罩关闭模态框时时触发
  close(){
    console.log('关闭评论组件')
    SeetingModule.setState({state: 'write_show', value: false})
  }
}
</script>

<style lang="scss" scoped>
.cmp{
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100% !important;
  height: auto;
  overflow: hidden;
  z-index: 9;
}

</style>