<template>
	<view class="cmp" :class="[`theme-${$store.state.Seeting.theme.name}`]">
		<view class="header">
      <view class="icon-font">
				<text name="arrow-left" class="iconfont icon-fanhui"  @click="back(cmpData.leftUrl)"></text>
			</view>
      <view class="title">{{ cmpData.title }}</view>
			<view class="icon-font right">
				<text class="subtitle" v-if="cmpData.subtitle"  @click="back(cmpData.rightUrl)">{{cmpData.subtitle}}</text>
				<text name="arrow-right" class="iconfont icon-fanhui2" :class="[cmpData.rightIcon?'':'hidden']" @click="back(cmpData.rightUrl)"></text>
			</view>
		</view>
	</view>
</template>

<script lang='ts'>
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'

@Component({})
export default class Head extends Vue{
@Prop (Object) cmpData?: Object

back(url?: string) {
	let arr = ['/pages/home/index','/pages/myListen/index','/pages/play/index','/pages/mine/index']
	let flag = arr.find(item=>{return url === item})

	if(!url){
		uni.navigateBack({delta: 1})
		return
	}

	if(url && flag){
		uni.switchTab({url})
	}else{
		uni.navigateTo({url})
	}

}

}

</script>

<style lang="scss" scoped>
.cmp {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: $header-margin-top;
	font-size: 36rpx;
	overflow: hidden;
	z-index: 99;
}
.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	height: $header-margin-top;
	padding-right: $space-norm;
  .icon-font{
		flex: 1;
		text-indent: 10rpx;
		.iconfont{
			font-size: 46rpx;
		}
  }
	.right{
		text-align: right;
		margin-right: $space-norm;
		.subtitle{
			font-size: 28rpx;
		}
	}
}
.hidden{
  visibility: hidden;
}
</style>
