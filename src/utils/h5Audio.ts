import { PlayModule } from "@/store/modules/play"


let H5Audio: any = null

let init = function(){
  if(H5Audio) return H5Audio
  H5Audio = uni.createInnerAudioContext() 
  return H5Audio
}

//更新音频资源
let resume = function(data: any) {
  console.log('h5端更新音频：',data)
  H5Audio.src = data.link
}

//开始播放 | 暂停播放
let playOrPause = function(playing: boolean) {
  console.log('playing',playing)
  PlayModule.setState({ state: 'playing', value: playing })
  if (playing) {
    H5Audio.play()
  } else {
    H5Audio.pause()
  }
}


export default{
  init,
  resume,
  playOrPause,
}