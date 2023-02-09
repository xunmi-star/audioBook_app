<template>
  <view class="cmp">
    <u-navbar
      :bgColor="$store.state.Seeting.theme.bcgColor"
      :titleStyle="{ color: $store.state.Seeting.theme.fontColor }"
      :title="cmpData.title"
      :safeAreaInsetTop="navbarData.safeAreaInsetTop"
      :placeholder="navbarData.placeholder"
      :fixed="navbarData.fixed"
      @leftClick="back(cmpData.leftUrl)"
      @rightClick="back(cmpData.rightUrl)"
    >
      <view class="u-nav-slot" slot="right">
        <text>{{ cmpData.subtitle }}</text>
      </view>
    </u-navbar>
  </view>
</template>

<script lang='ts'>
import { Component, Vue, Watch, Prop } from "vue-property-decorator";

@Component({})
export default class Head extends Vue {
  @Prop(Object) cmpData?: Object;

	private navbarData: Object = {
		safeAreaInsetTop: true as boolean, //是否开启顶部安全区适配
		placeholder: !true as boolean, //固定在顶部时，是否生成一个等高元素，以防止塌陷
		fixed: !true as boolean, //导航栏是否固定在顶部
	}

  back(url?: string) {
    let arr = [
      "/pages/home/index",
      "/pages/myListen/index",
      "/pages/play/index",
      "/pages/mine/index",
    ];
    let flag = arr.find((item) => {
      return url === item;
    });

    if (!url) {
      uni.navigateBack({ delta: 1 });
      return;
    }

    if (url && flag) {
      uni.switchTab({ url });
    } else {
      uni.navigateTo({ url });
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
