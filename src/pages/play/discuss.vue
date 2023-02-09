<template>
	<view class="page" :class="[$changeColor('block-bcg'), $changeColor('block-font')]">
    <Header :cmpData="headerCmp"></Header>
		<view class="all-discuss-box">
			<text>全部品论</text>
			<text class="font-mine" :class="[$changeColor('block-font2')]">{{allComment.length}}</text>
		</view>
		<view 
    class="discuss-box" 
    :class="[index]==commentList.length-1?'padding-bottom':''" 
    v-for="(item, index) in commentList" 
    :key="index">
			<view class="left"><image :src="`${item.avatar ? $ossUrl + item.avatar : '/static/image/tx.png' }`" mode="aspectFill"></image></view>
			<view class="right font-small">
				<view class="top">
					<view class="name">
						<text>{{ item.createBy }}</text>
						<text class="font-mine" :class="[$changeColor('block-font2')]">{{ item.createTime }}</text>
					</view>
					<view class="action-icon">
						<text class="font-big iconfont icon-liuyan" @click="setReply(item)"></text>
						<u-icon name="thumb-up" @click="thumbUp(item)" color=""></u-icon>
						<text class="count font-mine" v-if="item.likeNum">{{item.likeNum}}</text>
					</view>
				</view>
				<view class="content">{{ item.content }}</view>
				<view class="reply-box" :class="[$changeColor('block-bcg2')]" v-if="item.reply && item.reply.length>0">
					<view class="item" v-for="(item2, index2) in item.reply.slice(0,3)" :key="index2">
						<text class="username">{{ item2.createBy }}</text>
						<text class="blue" v-if="item2.replyMan">回复</text>
						<text class="username">{{ item2.replyMan }}</text>
						<text class="font-mine" :class="[$changeColor('block-font2')]">{{item2.createTime}}</text>
						<view class="text">{{ item2.content }}</view>
					</view>
					<view class="all-reply font-mine" @click="openComment(item)">
						查看全部{{item.reply.length}}条回复
						<u-icon class="more" name="arrow-right" :size="20" color=""></u-icon>
					</view>
				</view>
			</view>
		</view>

		<!-- 展开评论 -->
		<u-popup :show="popup.show" mode="bottom"  @close="close">
			<scroll-view scroll-top="0" scroll-y="true" class="scroll-Y pop-box" :class="[$changeColor('block-bcg2')]">
				<view class="head">
					<text>评论详情</text>
					<u-icon name="close" size="42rpx" @click="close" color=""></u-icon>
				</view>
				<view class="comment-parent">
					<view class="discuss-box">
						<view class="left"><image :src="`${popup.parent.avatar ? $ossUrl + popup.parent.avatar : '/static/image/tx.png' }`" mode="aspectFill"></image></view>
						<view class="right font-small">
							<view class="top">
								<view class="name">
									<text>{{ popup.parent.createBy }}</text>
									<text class="font-mine" :class="[$changeColor('block-font2')]">{{ popup.parent.createTime }}</text>
								</view>
								<view class="action-icon">
									<text class="font-big iconfont icon-liuyan" @click="setReply(popup.parent)"></text>
									<u-icon name="thumb-up" @click="thumbUp(popup.parent)" color=""></u-icon>
									<text class="count" v-if="popup.parent.likeNum">{{popup.parent.likeNum}}</text>
								</view>
							</view>
							<view class="content">{{ popup.parent.content }}</view>
						</view>
					</view>
				</view>
				<view class="null-line"></view>
				<view class="comment-son font-small">
					<view class="title">相关回复共{{popup.sonList.length}}条</view>
					<view class="discuss-box" v-for="(item,index) in popup.sonList" :key="index">
						<view class="left"><image :src="`${item.avatar ? $ossUrl + item.avatar : '/static/image/tx.png'}`" mode="aspectFill"></image></view>
						<view class="right">
							<view class="top">
								<view class="reply-man" v-if="item.replyMan">
									<text class="name">{{ item.createBy }}</text>
									<text class="blue">回复</text>
									<text class="name">{{ item.replyMan }}</text>
								</view>
							</view>
							<view class="content">{{ item.content }}</view>
							<view class="action-icon">
								<text class="date font-mine" :class="[$changeColor('block-font2')]">{{ item.createTime }}</text>
								<u-icon name="thumb-up" @click="thumbUp(item)" color=""></u-icon>
								<text class="count" v-if="item.likeNum">{{item.likeNum}}</text>
								<text class="font-big iconfont icon-liuyan" @click="setReply(item)"></text>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</u-popup>

		<!-- 底部输入框 -->
		<view class="write-box font-small" :class="[$changeColor('block-bcg2')]">
      <view class="pj" :class="[$changeColor('block-bcg3')]" @click="clickInput">
				<text name="iconfont icon-pinglun"></text>
				<text>发表评论...</text>
      </view>
    </view>
    <Wrap :cmpScrollTop="scrollTop"></Wrap>
		<WriteDiscuss v-if="$store.state.Seeting.write_show" :cmpData="discussData" @paramesSon="fromWrite"></WriteDiscuss>
	</view>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'

import Header from '@/components/header.vue'
import Wrap from '@/components/wrap.vue'
import WriteDiscuss from '@/components/writeDiscuss.vue'

@Component({name: 'Discuss', components: { Header, Wrap, WriteDiscuss }})
export default class Discuss extends Vue {
  private scrollTop: number = 0
  private headerCmp = {
    leftUrl: '/pages/play/index' as string,
    leftIcon: '' as string,
    title: '评论列表' as string, 
    rightUrl: '' as string,
    rightIcon: '' as string,
  }
	private allComment: any = [] // 完整的评论信息
	private commentList: any = [] //组装完毕后的评论信息

	private popup = {
		show: false as boolean,
		parent: {} as any,
		sonList: {} as any,
	}

	private discussData: any = {
		parentId: 0 as number,
	}

  //滚动距离
  onPageScroll(e: any) {
		this.scrollTop = e.scrollTop;
	}

	onLoad() {
		this.init()
	}

	init(){
		this.popup.show = false
		this.commentList = []
		this.getdiscuss();
	}

	// 组件传值
	fromWrite(parames: any){
    if(parames.show === false){
      this.init()
    }
  }

	//点击输入框
	clickInput(){
		this.$store.commit('Seeting/setState',{state: 'write_show', value: true})
	}

	// 点赞 
	thumbUp(item: any) {
		uni.showToast({title: '评论点赞功能暂未开放',icon: 'none'})
	}

	//展开评论弹窗
	openComment(item: any){
		this.popup.show = true
		this.popup.parent = item
		this.popup.sonList = item.reply
	}

	//关闭评论弹窗
	close(){
		this.popup.show = false
	}

	//回复评论
	setReply(item: any){
		this.discussData.parentId = item.id
		this.$store.commit('Seeting/setState',{state: 'write_show', value: true})
	}

	//获取评论列表
	getdiscuss() {
		let params = {
      audioId: this.$store.state.Play.audioId,
    }
		this.$httpRequest.get(this.$httpApi.getCommentByAudioId, {params}).then((res: any)=>{
			this.allComment = res.data
			this.initComment()
		})
	}

	//组装一级评论
	initComment(){
		let list = (uni as any).$u.deepClone(this.allComment)
		if(Array.isArray(list)){
			list.map((item:any, index: number)=>{
				if(item.parentId === 0){//一级评论
					this.commentList.push(item)	
				}
				if(index >= list.length-1){
					this.commentList.map((item:any)=>{
						this.initReplay(item)
					})
				}
			})
		}
	}

	//组装二级评论
	initReplay(data: any){
		let list = (uni as any).$u.deepClone(this.allComment)
		this.$set(data, 'reply', [])
		if(Array.isArray(list)){
			list.map((item:any)=>{
				if(data.id === item.parentId){//二级评论
					data.reply.push(item)

					this.initReplayThird2(item).then((arr: any)=>{
						data.reply = data.reply.concat(arr)
					})
				}
			})
		}
	}

	//组装三级评论
	initReplayThird2(data: any){
		return new Promise((resolve: any, reject: any)=>{
			let arr: any = []
			let list = (uni as any).$u.deepClone(this.allComment)
			if(Array.isArray(list)){
				list.map((item:any, index: number)=>{
					if(data.id === item.parentId){//三级评论
						item.replyMan = data.createBy
						arr.push(item)
					}
					if(index >= list.length-1){
						resolve(arr)
					}
				})
			}
		})
	}
}
</script>

<style lang="scss" scoped>
.all-discuss-box{
	margin: $space-norm $space-norm 0;
	padding: 10rpx 0;
	text:nth-child(2){
		margin-left: 15rpx;
	}
}

.discuss-box {
	display: flex;
	padding: $space-norm;
	.left {
		image {
			width: 64rpx;
			height: 64rpx;
			border-radius: 50%;
		}
	}
	.right {
		flex: 1;
		padding-left: $space-block;
		.top {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 10rpx;
			.action-icon{
				display: flex;
				align-items: center;
				.date{
					color: #9a9a9a;
					font-size: 24rpx;
					margin-right: $space-block;
				}
				.count{
					margin: 0 $space-block 0 5rpx;
				}
				.u-icon{
					::v-deep .u-icon__icon{
						font-size: 40rpx !important;
						margin-left: 10rpx;
					}
				}
			}
			.name {
				text:nth-child(1){
					color: $color-warning;
					margin-right: 10rpx;
				}
			}
			.reply-man{
				text:nth-last-child(2){
					margin: 0 15rpx;
				}
			}
			.like {
				display: flex;
				align-items: center;
				color: #9a9a9a;
				font-size: 26rpx;
				.num {
					margin-right: 4rpx;
					color: #9a9a9a;
				}
			}
			.highlight {
				color: #5677fc;
				.num {
					color: #5677fc;
				}
			}
		}
		.reply-box {
			border-radius: 12rpx;
			margin-top: 10rpx;
			.item {
				padding: $space-block;
				text:nth-child(2){
					font-size: 24rpx;
					margin: 0 10rpx;
				}
				text:nth-last-child(2){
					margin-left: 10rpx;
				}
				.username {
					font-size: 24rpx;
					color: #999999;
				}
			}
			.all-reply {
				padding: $space-block;
				display: flex;
				color: $color-warning;
				align-items: center;
				.more {
					margin-left: 6rpx;
				}
			}
		}
	}
}

.write-box{
	position: fixed;
	bottom: 0;
	left: 0;
	width: 100%;
	padding: 5rpx 0;
  .pj{
		margin: 40rpx 78rpx;
		padding: 28rpx;
		border-radius: 200rpx;
  }
}
.padding-bottom{
  padding-bottom: 100rpx;
}

::v-deep .u-popup{
	position: relative;
	z-index: 8 !important;
}
.pop-box{
	max-height: 70vh;
	.head{
		padding: $space-block;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 2px solid rgba(255,255,255,0.3);
		font-weight: bold;
	}
	.null-line{
		width: 100%;
		height: 15rpx;
		background: rgba(255,255,255,0.3);
	}
	.comment-son{
		.title{
			font-size: 24rpx;
			padding: $space-block $space-block 0;
		}
		.discuss-box{
			border-bottom: 2px solid rgba(255,255,255,0.3);
		}
		.discuss-box:nth-last-child(1){
			border: none;
		}
	}
}

.blue{
	color: $color-warning;
}
</style>
