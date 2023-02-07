<template>
  <view class="cmp" :class="[`theme-${$store.state.Seeting.theme.name}`]">
    <u-modal :show="$store.state.Seeting.write_show" :showConfirmButton="false" :closeOnClickOverlay="true" @close="close">
      <view class="slot-content" :class="[$changeColor('block-bcg2')]">
        <textarea class="textarea" :class="[$changeColor('block-bcg3')]" maxlength="300" v-model="sendContent" placeholder="请输入评论内容" name="" id="" cols="30" rows="10"></textarea>
        <view class="remark">
          <view class="left">标记时间点<text>00.03</text></view>
          <view class="right">{{ sendContent.length }}/300</view>
        </view>
        <view class="footer">
          <view class="left">
            <u-checkbox-group>
              <u-checkbox @change="checkboxChange" labelColor="inherit" active-color="#f0ad4e" :checked="true" label="同步到动态" name="同步到动态"></u-checkbox>
            </u-checkbox-group>
          </view>
          <u-button class="right" type="warning" text="发送" @click="sendComment"></u-button>
        </view>
      </view>
		</u-modal>

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

::v-deep .u-popup__content{
  position: fixed;
  width: 100% !important;
  border-radius: 0 !important;
  bottom: 0;
  background: inherit;
}

::v-deep .u-modal{
  width: 100% !important;
}

::v-deep .u-modal__content{
  padding: 0 !important;
}

.slot-content {
  padding: 5rpx $space-norm 0px $space-norm; 
  width: 100%;
  font-size: 28rpx;
}
.textarea{
  width: 100%;
  height: 170rpx;
  padding: 15rpx 0;
  margin-top: $space-norm;
  border-radius: 10rpx;
}
.uni-textarea-placeholder{
  color: inherit;
  text-indent: 1em;
}
.remark{ 
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 $space-norm 0;
  text{
    margin-left: 0.5em;
    color: #f86442;
  }
}
.footer{
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: $space-norm 0;
  .left{
    flex: 8;
  }
  .right{
    border-radius: 40rpx;
    font-size: 28rpx;
    width: 140rpx;
  }
}
</style>