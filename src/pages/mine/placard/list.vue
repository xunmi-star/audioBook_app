<template>
  <view class="page" :class="[$changeColor('block-bcg')]" :style="$store.state.Seeting.initTheme">
    <Header :cmpData="headerCmp"></Header>

    <view class="main-box">
      <navigator
        class="item"
        :class="[$changeColor('block-bcg2')]"
        :url="`/pages/mine/placard/detail?id=${item.noticeId}`"
        v-for="(item, index) in list"
        :key="index"
      >
        <view class="pj-top font-small">
          <view class="left">
            <text class="iconfont icon-tongzhi stress-font"></text>
            <text>{{ item.noticeTitle }}</text>
          </view>
          <view class="right">
            <view class="font-mine">{{ item.createTime }}</view>
          </view>
        </view>
        <view class="pj-center font-small u-line-2">
          <text>{{ item.noticeContent }}</text>
        </view>
        <view class="pj-bottom">
          <text class="font-small stress-font">查看详情</text>
          <text class="iconfont icon-fanhui2"></text>
        </view>
      </navigator>
    </view>
  </view>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";

import Header from "@/components/header.vue";

@Component({ name: "Feedback", components: { Header } })
export default class Feedback extends Vue {
  private headerCmp = {
    leftUrl: "/pages/mine/index" as string,
    title: "公告" as string,
  };
  private list = [] //公告列表

  onLoad() {
    this.init();
  }

  init() {
    this.getFeedRecord();
  }

  getFeedRecord() {
    this.$httpRequest.get(this.$httpApi.noticeList).then((res: any) => {
      res.rows.map((item: any)=>{
        item.noticeContent = item.noticeContent.substring(item.noticeContent.indexOf('<p>') + 3, item.noticeContent.indexOf('</p>'))
      })
      this.list = res.rows
    });
  }
}
</script>

<style lang="scss" scoped>
.main-box {
  margin: 0 $space-norm $space-norm;
  .item{
    padding: $space-norm;
    margin: $space-block 0;
    .pj-top{
      display: flex;
      align-items: center;
      justify-content: space-between;
      .iconfont{
        margin-right: 10rpx;
      }
    }
    .pj-center{
      margin: 32rpx 0;
    }
    .pj-bottom{
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
}
</style>
