<template>
  <view class="cmp" :class="[$changeColor('block-bcg2')]">
    <view class="item-box" :style="cmpPostion.style" v-show="cmpShow">
      <view class="item" v-for="(item, index) in cmpList" :key="index">
        <text :class="[item.state===1?'act':'']" @click="changeSelect(item)">{{ item.value }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, PropSync } from 'vue-property-decorator'

//下拉框组件
@Component({name: 'selectDown'})
export default class Popup extends Vue{
  @PropSync('cmpList', {type: Array}) syncedCmpList!: any

  @PropSync('cmpPostion', {type: Object}) syncedCmpPostion!: any

  @PropSync('cmpShow', {type: Boolean}) syncedCmpShow!: boolean

  changeSelect(data: any){
    this.syncedCmpList.map((item: any)=>{
      item.state = 0
    })
    data.state = 1
    this.syncedCmpShow = false

    this.$emit('getCmpFromSelectDown', data)
  }
}
</script>

<style lang="scss" scoped>
.cmp{
  position: absolute;
  width: 100%;
  border-bottom-left-radius: 10rpx;
  border-bottom-right-radius: 10rpx;
}

// TODO 这里可以做样式美化
.item-box{
  padding: 10rpx;
  .item{
    padding: 10rpx;
  }
}

.act{
  color: red;
}
</style>


