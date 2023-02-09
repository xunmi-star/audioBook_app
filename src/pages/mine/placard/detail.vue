<template>
  <view class="page" :class="[$changeColor('block-bcg')]" :style="$store.state.Seeting.initTheme">
    <Header :cmpData="headerCmp"></Header>

    <view class="main-box">
      <u-parse :content="content"></u-parse>
    </view>
   
  </view>
</template>

<script lang="ts">
import {Vue, Component, Watch} from 'vue-property-decorator'

import Header from '@/components/header.vue'

@Component({name: 'Feedback', components:{ Header }})
export default class Feedback extends Vue{ 
  private headerCmp = {
    leftUrl: '/pages/mine/placard/list' as string,
    title: '公告详情' as string, 
  }
  private id: number|null = null
  private content: string = ''

  onLoad(pass: any){
    this.id = Number(pass.id)
    this.init()
  }

  init(){
    this.getFeedRecord()
  }

  getFeedRecord(){
    let url = `${this.$httpApi.noticeInfo}/${this.id}` 
    this.$httpRequest.get(url).then((res:any)=>{
      this.content = res.data.noticeContent
		})
  }


}

</script>

<style lang="scss" scoped>
.main-box{
  padding: $space-block;
}


</style>
