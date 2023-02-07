<template>
  <view class="cmp">
		<view class="search-box" :class="[$changeColor('block-bcg3')]">
       <u-search :clearabled="false" :show-action="false" v-model="form.keyWord" @clickIcon="clickIcon" bg-color="transparent" color="#909399" placeholder="请输入关键字"></u-search>
     </view>
    <view class="swiper-box">
      <u-swiper :list="swiperList" keyName="url"></u-swiper>
    </view>

		<view class="youlike-box">
			<view class="title">猜你喜欢</view>
			<view class="change-batch">
				<text class="iconfont icon-xuanzhuan"></text>
				<view class="change" @click="changeResource">换一批</view>
			</view>
		</view>

		<view class="book-box font-medium">
			<navigator class="item" :url="`/pages/home/albumInfo?id=${item.id}`" v-for="(item,index) in albumList" :key="index">
				<view class="left">
					<u--image :src="$ossUrl + item.poster" width="160rpx" height="160rpx" radius="16rpx"></u--image>
				</view>
				<view class="right">
					<view class="pj">{{item.name}}</view>
					<view class="pj font-small" :class="[$changeColor('block-font')]">作者：{{item.author}}</view>
					<view class="pj font-mine" :class="[$changeColor('block-font2')]">
						<text>{{ item.episode }}集</text>
						<text>{{ item.finish === 1 ? '已完结' : '连载中' }}</text>
					</view>
				</view>
			</navigator>
		</view>
  </view>
</template>

<script lang="ts">
import {Component, Vue, Prop ,Watch} from 'vue-property-decorator'

import {SeetingModule} from '@/store/modules/seeting'

@Component({ name: 'Recommend' })
export default class Swiper extends Vue{
	private swiperList: any = []
	
	private albumList: object[]= [] 
	private loadStatus: string = 'loadmore' // 组件状态: loading: 加载中   nomore：没有了  loadmore：加载更多
	private form = {
		keyWord: '' as string, // 关键字
		page: 1 as number, //页码
		pageSize: 5 as number, //每一页的数据长度
	}
	private total: number = 0//总的专辑长度


	mounted(){ 
		this.init()
	}

	init(){
		this.getAlbumList()
		this.gteImageList()
	}

	//获取专辑  
	getAlbumList(){
		let params = {
			pageNum: SeetingModule.homePage,
			pageSize: this.form.pageSize,
			keyWord: this.form.keyWord,
		}
		this.$httpRequest.get(this.$httpApi.albumList, {params}).then((res:any)=>{
			this.albumList = res.rows
			this.total = res.total
		})
	}



	//获取专辑  
	gteImageList(){
		this.$httpRequest.get(this.$httpApi.imageList).then((res:any)=>{
			res.rows.map((item: any)=>{
				item.url = this.$ossUrl + item.url
			})
			this.swiperList = res.rows
		})
	}

	// 点击搜索框的图标
	clickIcon(){
		console.log('点击搜索框的图标')
		this.init()
	}

	//换一批
	changeResource(){
		if(this.form.pageSize * (SeetingModule.homePage)>this.total){
			SeetingModule.setState({state: 'homePage',value: 1})
			this.init()
		}else{
			SeetingModule.setState({state: 'homePage',value: SeetingModule.homePage+1})
			this.getAlbumList()
		}
	}
}
</script>



<style lang="scss" scoped>
.search-box{
	margin: $space-block $space-block 0;
	border-radius: 16rpx;
	::v-deep .u-search__content{
		flex-direction: row-reverse;
	}
}

.swiper-box{
	margin: $space-norm $space-block;
}

.youlike-box{
	display: flex;
	height: 70rpx;
	align-items: center;
	justify-content: space-between;
	margin: $space-block 0;
	padding: 0 $space-block;
	image{
		width: $space-norm;
	}
	.change-batch{
		display: flex;
		align-items: center;
		.iconfont{
			margin-right: 5rpx;
		}
	}
}

.book-box{
	padding: 0 $space-norm;
	.item{
		display: flex;
		height: 200rpx;
		margin-top: $space-block;
		.right{
			margin-left: $space-norm;
			margin-top: 10rpx;
			.pj{
				margin-bottom: 20rpx;
			}
			.pj:nth-last-child(1){
				text{
					margin-right: $space-block;
				}
			}
		}
	}
}
</style>