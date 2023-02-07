<template>
  <view class="cmp">
    <view class="card-box">
      <navigator class="item" :class="[$changeColor('block-bcg')]" :url="`/pages/home/albumInfo?fromMyListen=true&id=${item.albumId}`" v-for="item in list" :key="item.id">
        <u-image :src="$ossUrl + item.poster" width="210rpx" height="210rpx" radius="12rpx"></u-image>
        <view class="name font-small u-line-1">{{item.albumName}}</view>
      </navigator>
      <!-- 占位dom，对数组长度取余，余值为3时，不需要遍历占位dom（注意这里的key值需保持唯一性，此时别处的key不建议使用常规的index） -->
      <view class="item" v-for="index in (3 - list.length % 3) === 3 ? 0 : (3 - list.length % 3)" :key="index"></view>
    </view>
  </view>
</template>

<script lang="ts">
import {Vue, Component} from 'vue-property-decorator'

//订阅
@Component({name: 'subscribe', components:{}})
export default class Subscribe extends Vue{
  private list: object[] = [] 
  private butList1? = [
    {flag: true, label: '最近常听', state: 0},
    {flag: false, label: '最近更新', state: 1},
    {flag: false, label: '最近订阅', state: 2},
  ] as object[]
  private butList2? = [
    {flag: true, label: '全部', state: 0, number: 1},
    {flag: false, label: '完结', state: 1, number: 0},
    {flag: false, label: '连载中', state: 2, number: 1},
  ] as object[]
  private flags = {
    selection: false as Boolean,//赛选
    more: false as Boolean,//简介
  } as object

  mounted(){
    this.init()
  }

  init(){
    this.getSubscribeList()
  }

  //获取订阅列表
  getSubscribeList(){
    let params = {
      pageNum: 1,
      pageSize: 10,
    }
    this.$httpRequest.get(this.$httpApi.subscribeList).then((res: any)=>{
      this.list = res.rows
    })
  }

  //选中赛选里面的按钮
  select(item: any, arr: object[]){
    arr.map((res: any)=>{
      res.flag = false
    })
    item.flag = true

  }
   // 打开更多
  open(content: string){
    uni.showToast({icon: 'none', title: '打开简介弹窗'})
    console.log('弹窗:',content)
  }
}

</script>

<style lang="scss" scoped>
.card-box{
  display: flex;
  align-content: center;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-top: 150rpx;
  padding: 0 $space-norm;
  .item{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 31%;
    text-align: center;   
    border-radius: 12rpx; 
    margin-bottom: 60rpx;
    .name{
      width: 100%;
      margin-top: 10rpx;
    }
  }
}

.weight{
  font-weight: bold;
}
</style>
