import { PlayModule } from "@/store/modules/play"
export default (function () {
  let audioMannager: UniApp.BackgroundAudioManager
  class AudioController {
    init({ canplay, play, pause, stop, end, timeUpdate, error, waiting }: any) {
      //获取 uni-app 音乐播放器
      if (audioMannager) return audioMannager

      audioMannager = uni.getBackgroundAudioManager()

      canplay && audioMannager?.onCanplay(canplay)

      play && audioMannager?.onPlay(play)

      pause && audioMannager?.onPause(pause)

      stop && audioMannager?.onStop(stop)

      end && audioMannager?.onEnded(end)

      timeUpdate && audioMannager?.onTimeUpdate(timeUpdate)

      // @ts-ignore: Unreachable code error
      error && audioMannager?.onError(error)

      waiting && audioMannager?.onWaiting(waiting)

      return audioMannager
    }

    //更新通知栏信息，播放，初始化音乐播放器
    resume(data: any) {
      console.log('更新音频资源：',data)
      audioMannager.title = data?.title
      audioMannager.singer = data?.author
      audioMannager.coverImgUrl = data?.poster
      audioMannager.src = data?.link

      //本地播放一集自然结束后，音频会暂停，此时需手动触发一次播放事件 
      if(PlayModule.playMode === 1){
        this.playOrPause(true)
      }
    }

    //开始播放 | 暂停播放
    playOrPause(playing: boolean) {
      PlayModule.setState({ state: 'playing', value: playing })
      if (playing) {
        audioMannager?.play()
      } else {
        audioMannager?.pause()
      }
    }

    //修改播放进度 （快进、快退
    seek(position = 0) {  
      // @ts-ignore: Unreachable code error
      audioMannager?.seek(position)
    }

    /**
     * 设置倍速播放    UniApp.BackgroundAudioManager不支持倍速播放
     * @param value 支持的倍率有 0.5/0.8/1.0/1.25/1.5/2.0
     */
    playbackRate(value: number){ 
      console.log('当前倍率:',value)
      // @ts-ignore: Unreachable code error
      audioMannager.playbackRate = value
    }

    //暂停播放
    stop() {
      audioMannager?.stop()
    }

    //歌曲时长
    duration() {
      return audioMannager.duration || 0
    }

    //播放进度
    currentTime() {
      return audioMannager.currentTime || 0
    }
  }

  return new AudioController()
})()
