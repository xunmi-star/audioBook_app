<template>
  <view class="cmp" :style="$store.state.Seeting.initTheme">
    <u-popup class="popup" :round="25" :show="syncedCmpShow" mode="bottom" @close="closePop">
      <view class="content" :class="[$changeColor('block-bcg')]">
        	<view class="head-box">
            <view class="head">
              <view class="close" @click="closePop">取消</view>
              <view class="title">{{cmpTitle || '选项标题'}}</view>
              <view class="sure" @click="sure">确定</view>
            </view>
          </view>
          <scroll-view class="main" scroll-y="true">
            <view class="item" :class="[$changeColor('block-bcg2'), item.isSelect?'act':'']" v-for="item in syncedCmpList" :key="item.end" @click="slectChange(item)">
              <text class="nav">{{ item.start }}-{{ item.end }}</text>
            </view>
            <!-- 占位dom，对数组长度取余，余值为3时，不需要遍历占位dom（注意这里的key值需保持唯一性，此时别处的key不建议使用常规的index） -->
            <view class="item" v-for="index in (3 - syncedCmpList.length % 3) === 3 ? 0 : (3 - syncedCmpList.length % 3)" :key="index"></view>
          </scroll-view>
      </view>
		</u-popup>
  </view>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, PropSync } from 'vue-property-decorator'

@Component({})
export default class ChapterNav extends Vue{
  @PropSync('cmpShow', {type: Boolean}) syncedCmpShow!: boolean //弹窗的显示与隐藏
  @PropSync('cmpSelectMore', {type: Boolean}) syncedSelectMore!: boolean //允许多选

  @PropSync('cmpSection', {type: Number}) syncedSection!: number //已经选中的排序

  @Prop({type: Number, default: 0}) cmpTotal?: number //总的章节数
  @Prop({type: Number, default: 20}) cmpStep?: number //步进值

  @Prop({type: String}) cmpTitle?: string //导航标题
  /** 
  * @Object 项目列表  PropSync装饰器会与父组件的数据进行双向绑定
    * @parame  name： 子项目名称
    * @parame  index: 子项目索引，也是唯一标识符
    * @parame  state： 1：选中 0：未选中
    */
  @PropSync('cmpList', {type: Array}) syncedCmpList!: any 

  mounted(){

  }

  init(){

  }

  //选项改变
  slectChange(data: any){
    this.syncedCmpList.map((item: any)=>{
      item.isSelect = false
      if(item.id === data.id){
        item.isSelect = true
      }
    })

    this.$emit('getPopupCmp',data)
    this.closePop()
  }

  //弹窗的关闭
  closePop(){
    this.syncedCmpShow = false
  }

  //弹窗后的确认
  sure(){
    this.syncedCmpShow = false
  }
}
</script>

<style lang="scss" scoped>
.content{
  position: relative;
  width: 100%;
  min-height: 50vh;
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
  }
}
.main{
  padding-top: 150rpx;
  max-height: 800rpx;
  ::v-deep .uni-scroll-view-content{
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    align-content: center;
    .item{
      width: 30%;
      border-radius: $border-small;
      text-align: center;
      padding: 15rpx 0;
      margin: 15rpx 0;
      .nav{
        padding: 5rpx 0;
      }
    }
  }
}

.act{
  color: $color-error;
}
</style>
