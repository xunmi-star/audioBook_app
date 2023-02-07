<template>
	<view class="cmp wrap">
		<u-back-top :scrollTop="cmpScrollTop" :mode="mode" :iconStyle="iconStyle" :top="top" :duration="duration"></u-back-top>
	</view>
</template>

<script lang="ts">
import {Vue,Component,Prop} from 'vue-property-decorator'
@Component({})
export default class Wrap extends Vue{
	@Prop(Number) cmpScrollTop?: number
	
	private duration: string|number = 50 //返回顶部过程中的过渡时间，单位ms
	private mode: string = 'square'
	private top: string|number = 400//距離頂部多少px時展示
	private iconStyle = {
		fontSize: '$space-norm' as string,
		color: '#2979ff' as string
	}
	
	mounted(){}
}
</script>

<style lang="scss" scoped>
.u-back-top{
	background: rgba(225, 225, 225, 0.5);
}
</style>