<template>
  <view class="cmp">
    <u-popup class="popup" :round="25" :show="syncedCmpShow" mode="bottom" @close="closePop">
      <view class="content">
        	<view class="head-box">
            <view class="head">
              <view class="close" @click="closePop">取消</view>
              <view class="title">{{cmpTitle || '选项标题'}}</view>
              <view class="sure" @click="sure">确定</view>
            </view>
          </view>
          <scroll-view class="main" scroll-y="true">
            <view class="pj" v-for="(item,index) in syncedCmpList || []" :key="index">
              <view class="item" @click="slectChange(item)">
                <view class="left">{{item.name}}
                  <text class="remark" v-if="item.remark">({{item.remark}})</text>
                </view>
                <text :class="[item.state===0?'iconfont icon-yuanxingweixuanzhong':'iconfont icon-yuanxingxuanzhong']"></text>
              </view>
            </view>
          </scroll-view>
      </view>
		</u-popup>
  </view>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, PropSync } from 'vue-property-decorator'

@Component({name: 'Popup'})
export default class Popup extends Vue{
  //弹窗的标题
  @Prop ({type: String}) cmpTitle?:string

  /** 
  * @Object 项目列表  PropSync装饰器会与父组件的数据进行双向绑定
    * @parame  name： 子项目名称
    * @parame  index: 子项目索引，也是唯一标识符
    * @parame  state： 1：选中 0：未选中
    */
  @PropSync('cmpList', {type: Array}) syncedCmpList!: any 

  //弹窗的显示与隐藏
  @PropSync('cmpShow', {type: Boolean}) syncedCmpShow!: boolean 

  private selectItem: any = {} //选中项

  //选项改变
  slectChange(data: any){
    this.syncedCmpList.map((item: any)=>{
      item.state = 0
    })
    data.state = 1
    this.selectItem = data
  }

  //弹窗的关闭
  closePop(){
    this.syncedCmpShow = false
  }

  //弹窗后的确认
  sure(){
    this.syncedCmpShow = false
    this.$emit('getPopupCmp', this.selectItem)
  }
}

</script>

<style lang="scss" scoped>
.content{
  position: relative;
  width: 100%;
  color: rgba(0,0,0,1);
  z-index: 9;
}
.head-box{
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  .head{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: $space-norm $space-norm;
    padding: 22rpx 0;
    font-weight: bold;
    .close{
      color: #999999FF;
    }
  }
}
.main{
  padding-top: 150rpx;
  max-height: 800rpx;
  .pj{
    .item{
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: $space-block $space-norm;
      padding: $space-block 0;
      .left{
        .remark{
          color: rgba(254,105,5,0.7);
          font-size: 24rpx;
        }
      }
      .iconfont{
        font-size: 42rpx;
      }
    }
  }
}
</style>