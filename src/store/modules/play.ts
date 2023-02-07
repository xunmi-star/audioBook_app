import {
  VuexModule,
  Module,
  Action,
  Mutation,
  getModule,
} from 'vuex-module-decorators'
import store from '@/store'
import requestApi from '@/utils/requestApi'
import requestHttp from '@/utils/request'
import tool from '@/utils/tool'
import storage from '@/utils/storage'
import { readFile, readFileSize, downloadImg, addDownloadDtask,enumerateDwonload } from '@/utils/plusDownload'
import { encrypt,decrypt } from "@/utils/encryp"
import config from '@/config'
import h5Audio from '@/utils/h5Audio'
import audioController from '@/utils/audioController'
import musicNotification from '@/utils/musicNotification'
import Vue from 'vue'

// TS类型接口
export interface palyKey {}

/**
 * @title Module装饰器
 * @param {string } Play module名称，开启命名空间后会以name为命名空间
 * @param {boolean } dynamic 动态加载(简而言之只有在用到当前的module才会加载)
 * @param {boolean } namespaced 是否开启命名空间，如果你的模块很多，强烈建议开启
 * @param {boolean } preserveState 是否启用持久化存储，防止页面刷新属性丢失(适用于h5端)
 * @param {object } store 挂载的store目标
 */
@Module({name: 'Play', dynamic: true,namespaced: true,preserveState: config.preserveState, store })
class Play extends VuexModule implements palyKey {
  public once_play: boolean = true //播放页面第一次点击播放会用到
  public playing: boolean = false ////播放状态
  public isOpenNotification: boolean = false //通知栏打开的标志
  public isHistoryPlay: boolean = false //音频从某个时间点开始播放的标志

  public start_time: number = 0 //音频开始播放的位置（单位：s）
  public current_time: number = 0 //当前音频的播放进度（单位：s），只有在当前有合法的 src 时返回
  public duration: number = 0 //当前音频的总长度（单位：s），只有在当前有合法的 src 时返回
  public timerCount: number = 0 //当前音频播放的进度，每播放5秒就缓存一次音频的播放进度
  public countTime: number = 5 //缓存音频的间隔时间（单位：s）
  public playMode: number = 0 //播放模式 0：使用网络资源 1：使用本地资源

  public openReciprocal: boolean = false //开启倒计时 
  public reciprocalTimer: number = 0 //倒计时时间
  public reciprocalNum: number = 0 //倒计时集数(表示倒数第0集)

  public albumId: number|null = null //当前专辑id
  public audioId: number|null = null //当前音频id

  public albumInfo: any = {} //专辑信息
  public audioInfo: any = {} //音频信息

  public audioIsDownloaded: boolean = false //当前音频是否已经下载到本地

  public cacheList: object[] = [] //缓存音频播放记录
  public cacheAlbumList: object = [] //下载的专辑列表
  public cacheAudioList: object = [] //下载的音频列表
  public downloadedFileList: object[] = [] //已经下载到本地的专辑(里面包含音频)，预定是离线模式使用

  public downloadQueue: object[] = [] //下载队列 （是二级数组，按专辑区分)

  public dtaskListenKeyArr: string[] = [] //此次进入app后创建过的下载任务监听函数键名数组

  //直接修改state里参数的函数
  @Mutation
  setState(obj: any) {
    (this as any)[obj.state] = obj.value
    // console.log('vuex修改目标之后:',this.downloadQueue)
  }

  /**
 * 修改复杂数据对象里的指定属性
 * @param {object}  obj  
 *   state: 待操作的对象，如downloadQueue
 *   key：待操作的属性名
 *   value：键值
 */
  @Mutation
  setStateObj(obj: any) {
    Vue.set((this as any)[obj.state], obj.key, obj.value)
  }

   /**
   * 修改复杂数据对象(数组对象)里的参数
   * @param {object[]}  obj  
   *   state: 待操作的对象，如downloadQueue
   *   index: 待操作的对象的索引
   *   arrObj: 待操作的数组，如audioList
   *   keyOrIndex：待操作的键或者索引 
   *   value：键值
   */
    @Mutation
    setStateArrObj(obj: any) {
      Vue.set((this as any)[obj.state][obj.index][obj.arrObj], obj.keyOrIndex, obj.value)
    }

  /**
   * 播放模式处理
   * @param fromDownload 来自下载页面时，使用本地资源进行播放
   */
   @Action
   public async play(fromDownload?: boolean) {
     //重重置播放进度
     if(!this.isHistoryPlay){
       this.setState({state: 'current_time', value: 0})
     }

     //使用本地资源进行播放
     if(fromDownload){//使用本地资源进行播放
       PlayModule.setState({state: 'playMode', value: 1}) //使用本地资源进行播放
     }
     //使用网络资源进行播放
     if(!fromDownload){
       PlayModule.setState({state: 'playMode', value: 0})
       await this.getAudioFromLink()
      }
      
      this.resume()  //更新音频信息
   }
 
   //音频页面点击播放或暂停
   @Action
   public playOrPause(playing?: boolean) {
     if(playing===undefined){
      playing = false
     }
    if(playing != this.playing){
       // #ifdef H5
        h5Audio.playOrPause(playing)
       // #endif

       // #ifdef APP-PLUS
       audioController.playOrPause(playing)
       musicNotification.playOrPause(playing)
       // #endif
    }
   }

   //缓存当前的播放进度
   @Action
   public cacheCurrent_time(){
    this.addCacheAudio({info: this.audioInfo, objName: storage.keysObj.cacheList}).then((msg:any)=>{
      this.setState({state: 'timerCount', value: 0})
    })
   }

   /**
   * 本地播放时的数据处理
   * @param num +1 下一首  -1上一首
   */
    @Action
    public async cachePlay(num: number){
      uni.showLoading({title: '资源加载中...'})
      let list = await PlayModule.initDownloadedFile()
      uni.hideLoading()
      list.map((item: any)=>{
        if(item.id === this.albumId){
          let audioList: any = item.audioList || []
          let targetAudioIndex: number = audioList.findIndex((audioItem: any)=> audioItem.id === this.audioId)
          let playIndex: number = targetAudioIndex + num
          if(playIndex >= 0 && playIndex < audioList.length){
            this.setState({state: 'audioId', value: audioList[playIndex].id})
            
            //本地播放情况下，点击上，下一集，需把专辑名【name】补充上
            audioList[playIndex].name = this.albumInfo.name
            this.setState({state: 'audioInfo', value: audioList[playIndex]})

            //缓存音频的最新播放记录
            this.addCacheAudio({info: this.audioInfo, objName: storage.keysObj.cacheList})

            //更新音频信息
            this.resume()
            //如果是播放下一首，需考虑是否有开启集数倒计
            if(num > 0){
              this.reciprocal()
            }
          }else{
            let msg = num > 0 ? '下一章节':'上一章节'
            uni.showToast({title: `暂无${msg}`, icon: 'none'})
          }
        }
      })
    }

  /***
   * 网络资源播放时的数据处理
   * @param obj 
   *    isNoChangeAudio boolean 不改变音频播放资源 默认值为false(默认改变音频资源)
   *    audioId  number  音频id(默认不传音频id)
   * return 返回音频的详细信息
   */
  @Action
  public getAudioFromLink(obj: getAudioFromLink = { isNoChangeAudio: false, audioId: 0 }){
    return new Promise((resolve, reject)=>{
      let url = `${requestApi.api.getAudioByAudioId}?audioId=${obj.audioId || this.audioId}`
      requestHttp.http.get(url).then((res)=>{
        let data = res.data
        data.link = process.env.VUE_APP_BASE_OSS + res.data.link
        data.poster = process.env.VUE_APP_BASE_OSS + res.data.poster

        //同步音频在store里的最新信息
        this.setState({state: 'audioInfo', value: data})

        //更改音频资源
        if(!obj.isNoChangeAudio){
          //接口添加播放记录
          this.addRecordPlay()
  
          //缓存音频的最新播放记录
          this.addCacheAudio({info: this.audioInfo, objName: storage.keysObj.cacheList})
        }

        // #ifdef APP-PLUS
        this.isDownloaded()
        // #endif

        resolve(data)
      })
    })
  }

/**
 * 添加或移除下载队列
 *@param param 
  *  albumInfo 专辑信息  
  *  audioList 音频信息列表
  *  isAdd true: 新添需下载音频到下载队列  false: 移除...
  */
  @Action
  public addOrRemoveQueue(param: any){
    let info = (uni as any).$u.deepClone(param)
    info.albumInfo.audioList = info.audioList

    let list = uni.getStorageSync(storage.keysObj.downloadQueue) || []

    //待移除的专辑对象索引数组(场景：该专辑的音频下载完毕后，移除此专辑)
    let removerAlbumIndexArr: number[] = []
  
    let targetAlbum: any = {}
    let albumIndex: number = -1

    // 匹配待操作的专辑
    list.map((item: any, index: number)=>{
      if(item.id === param.albumInfo.id){
        albumIndex = index
        targetAlbum = item
      }
    })

    //如果任务队列里不存在此专辑且为添加操作,就将专辑信息整个添加进任务队列
    if(param.isAdd && Object.keys(targetAlbum).length < 1){
      info.albumInfo.audioList.map((item: any)=>{
        item.isDownloading = true
      })
      list.push(info.albumInfo)
    }
    
    //如果任务队列里已经存在此专辑，就按音频进行匹配后进行添加和移除
    if(Object.keys(targetAlbum).length > 0){
      //已有待下载的音频
      if(targetAlbum.audioList && targetAlbum.audioList.length > 0){
        info.albumInfo.audioList.map((item: any)=>{
          //队列中没有此音频
          let noTargetAudio = true 
          //队列中待移除的音频索引
          let removeIndex = -1
          targetAlbum.audioList.map((targetItem: any, targetIndex: number)=>{
            if(targetItem.id === item.id){
              noTargetAudio = false
              removeIndex = targetIndex 
            }
          })

          // 任务队列中没有此音频且为添加操作，则将其添加进任务队列中
          if(noTargetAudio && param.isAdd){
            item.isDownloading = true
            targetAlbum.audioList.push(item)
          }

          // 任务队列中有此音频且为移除操作，则将其移除
          if(removeIndex > -1 && !param.isAdd){
            targetAlbum.audioList.splice(removeIndex, 1)
            //音频列表长度为0时，移除此专辑信息
            if(targetAlbum.audioList.length < 1){
              removerAlbumIndexArr.push(albumIndex)
            }
          }

        })
      }else if(param.isAdd){
        //没有待下载的音频
        info.albumInfo.audioList.map((item: any)=>{
          item.isDownloading = true
        })
        targetAlbum.audioList = info.albumInfo.audioList
      }
    }

    //移除专辑
    removerAlbumIndexArr.map((removeIndex: number)=>{
      list.splice(removeIndex,1)
    })

    //同步storage和vuex
    storage.setStorage('PlayModule', 'downloadQueue', list)
  }


  /**
  * 开始 or 暂停下载队列
  * @param param 
  *    isAllEdit 编辑全部 
  *    isStart 开始
  *    albumId 待操作的专辑id
  *    audioList: 待操作的音频列表
  */
  @Action
  public startOrStopDownloadQueue(param: any){
    // let list = uni.getStorageSync(storage.keysObj.downloadQueue) || []
    let list = this.downloadQueue || []

    //全部开始 or 暂停
    if(param.isAllEdit){
      // 遍历任务队列里的专辑列表
      list.map((targetAlbum: any)=>{
        if(targetAlbum.audioList && targetAlbum.audioList.length>0){
          //遍历任务队列的音频列表
          targetAlbum.audioList.map((targetAudio: any)=>{
            targetAudio.isDownloading = param.isStart
          })
        }
      })
    }

    //部分开始 or 暂停
    if(!param.isAllEdit){
      // 遍历任务队列里的专辑列表
      let targetAlbum: any = {}
      list.map((item: any)=>{
        if(item.id === param.albumId){
          targetAlbum = item
        }
      })

      if(Object.keys(targetAlbum).length > 0){
        if(targetAlbum.audioList && targetAlbum.audioList.length>0){
          //遍历任务队列的音频列表
          targetAlbum.audioList.map((targetAudio: any)=>{
            //遍历待更改下载状态的音频列表
            param.audioList.map((item: any)=>{
              if(targetAudio.id === item.id){
                targetAudio.isDownloading = param.isStart
              }
            })
          })
        }
      }
    }

    //同步storage和vuex
    storage.setStorage('PlayModule', 'downloadQueue', list)
  }

  /**
   * 根据下载队列创建下载任务后执行下载任务
   * @param idInfo  有id表示为指定某个音频的单个下载，没有则表示是按下载队列执行下载
   *        albumId: 专辑id
   *        audioId: 音频id
   *        isSpecialLoading {boolean} true 特殊情况-允许单个音频从等待中状态直接下载的标志
   * @returns 
   */
  @Action
  public async runDownloadQueue(idInfo: any){
    if(this.downloadQueue.length < 1){
      uni.showToast({title: '下载队列为空', icon: 'none'})
      return
    }

    for(let i = 0; i < this.downloadQueue.length; i++){
      let targetAlbum: any = this.downloadQueue[i]
      let audioList = (uni as any).$u.deepClone(targetAlbum.audioList)
      if(audioList.length > 0){
        // 遍历专辑里的音频
        for(let j = 0; j< audioList.length; j++){
          let targetAudio: any = {}

          //单个下载or暂停
          if(Object.keys(idInfo).length>0){
            if(idInfo.albumId === targetAlbum.id && idInfo.audioId === audioList[j].id){
              targetAudio = audioList[j]
            }
          }
          
          //全部下载or暂停
          if(Object.keys(idInfo).length<1){
            targetAudio = audioList[j]
          }

          //专辑里有音频
          if(Object.keys(targetAudio).length>0){
            //开始下载
            if(targetAudio.isDownloading){
              let info: any = {
                albumInfo: targetAlbum,
                audioInfo: targetAudio,
                isSpecialLoading: idInfo.isSpecialLoading,
              }
              //移除info.albumInfo里多余的音频列表
              delete info.albumInfo.audioList

              //下载专辑图片
              let imgObj = {
                name: targetAlbum.name,
                albumId: targetAlbum.id,
                link: targetAudio.poster
              }
              downloadImg(imgObj)
  
              //新建音频下载任务对象
              let finallyParame: any = await addDownloadDtask(info)
              //新建下载任务对象成功
              if(finallyParame.state === 'success'){
                info.isOnce = true
                
                //触发某个音频的下载任务后直接退出整个函数
                console.log('准备下载:',targetAudio.title)
                enumerateDwonload()
                return
              }
              //新建下载任务对象失败
              if(finallyParame.state === 'err'){
                uni.showToast({title: finallyParame.msg, icon: 'none'})
              }
            }
            //暂停下载
            if(!targetAudio.isDownloading){
              this.editDtaskStopArr({albumId: targetAlbum.id, audioId: targetAudio.id})
            }
          }
        }
      }
    }
  }

  /**
   * 暂停下载任务
   *parames 
   *  albumId 专辑信息  
   *  audioId 音频信息
   */
  @Action
  public async editDtaskStopArr(parames: any){
    let targetAudio: any = {}
    let targetAlbumIndex: number = -1 
    let targetAudioIndex: number = -1
    // 遍历下载队列的专辑列表
    this.downloadQueue.map((albumItem: any, albumIndex: number)=>{
      if(albumItem.id === parames.albumId){
        //遍历下载队列的音频列表
        albumItem.audioList.map((audioItem: any, audioIndex: number)=>{
          if(audioItem.id === parames.audioId){
            targetAlbumIndex = albumIndex
            targetAudioIndex = audioIndex
            targetAudio = audioItem
          }
        })
      }
    })

    //下载队列无此音频
    if(Object.keys(targetAudio).length<1){ return }

    //枚举任务暂停下载，且改变其下载队列的状态
    plus.downloader.enumerate(function(tasks){
      let tasksList = tasks || []
      tasksList.map((item: any)=>{
        let audioFileName =  item.filename.substring(item.filename.lastIndexOf('/')+1, item.filename.lastIndexOf('.'))
        //解密枚举的文件名
        let parseAudio = JSON.parse(decrypt(audioFileName, config.AES_KEY, config.AES_IV))
        // 枚举任务为图片时，退出这一轮的循环
        if(parseAudio.isImg){ return }
        //专辑id和音频id都相同时，暂停该任务，且更改其在下载队列中的下载状态
        if(parseAudio.albumId === parames.albumId && parseAudio.id === parames.audioId){
          item.pause()
          
          console.log('准备暂停的任务:',targetAudio)
          
          targetAudio.downloadState = 5
          let potions = {
            state: 'downloadQueue',
            index: targetAlbumIndex,
            arrObj: 'audioList',
            keyOrIndex: targetAudioIndex,
            value: targetAudio,
          }

          setTimeout(()=>{
            //修改单个音频的在下载队列中的属性
            PlayModule.setStateArrObj(potions)
            //同步vuex与stora
            storage.setStorage('PlayModule', 'downloadQueue', PlayModule.downloadQueue)
          },500)
        }
      })
    })
  }

  /**
   * 音频下载完毕后的事件处理
   * @param info 下载信息
   *    albumInfo 专辑信息
   *    audioInfo 音频信息
   */
  @Action
  public afterDownload(info: any){
    //下载成功后播放页面的下载图标改为已下载
    if(this.audioId === info.audioInfo.id){
      this.setState({state: 'audioIsDownloaded', value: true})
    }
    //接口新增音频下载记录
    this.addRecordDownload()
    // 缓存下载的专辑信息        
    this.addCacheAudio({info: info.albumInfo, objName: storage.keysObj.cacheAlbumList}).then((msg:any)=>{
      uni.showToast({title: msg, icon: 'none'})
      // 缓存下载的音频信息
      this.addCacheAudio({info: info.audioInfo, objName: storage.keysObj.cacheAudioList}).then((msg: any)=>{
        uni.showToast({title: msg, icon: 'none'})
      })
    }).catch((err: any)=>{
      console.log('专辑缓存失败',err)
    })
  }

  /**
   * 新增缓存记录
   * parames:  info 专辑 或 音频 详情, objName 要添加缓存的数组对象名
   */
  @Action
  public addCacheAudio(parames: any){
    return new Promise((resolve: any, reject: any)=>{
      let obj = null
      let list = (uni as any).$u.deepClone(uni.getStorageSync(parames.objName)) || []
      if(list.length > 0){
        let repeatFlag = false
        //判定缓存是否重复
        list.map((item: any, index: number)=>{
          if(item.id === parames.info.id){
            repeatFlag = true
            if(parames.objName == 'cacheList'){
              //缓存音频播放记录时需要移除旧数据
              list.splice(index,1)
              repeatFlag = false              
            }
          }
        })

        if(repeatFlag){
          resolve(`${parames.objName}重复缓存`)
        }else{
          obj = parames.info
        }
      }else{//缓存列表为空时，把当前音频导入
        obj = parames.info
      }
      
      if(obj){
        if(parames.objName == 'cacheList'){
          //缓存音频的播放进度
          obj.newPlayDate = (uni as any).$u.timeFormat(new Date(), 'yyyy-mm-dd hh:MM:ss')
          obj.playedTime = this.current_time
        }
        list.unshift(obj)
        this.setState({state: parames.objName, value: list})
        uni.setStorageSync(parames.objName, list)
        resolve(`${parames.objName}新增缓存-${parames.info.title || parames.info.name}`)
      }
    })
  }

  //检查本地是否已下载过该音频
  @Action
  public isDownloaded(){
    let path = ''
    if(this.albumInfo.name){ path = `${this.albumInfo.name}-${this.albumId}`}
    this.setState({state: 'audioIsDownloaded', value: false})
    readFile(path).then((res: any)=>{
      res.map((item: any)=>{
        //文件名(不含后缀)
        let fileName = item.name.substring(0,item.name.lastIndexOf('.'))
        if(fileName !== 'img'){
          //文件名解码
          let fileObj = JSON.parse(decrypt(fileName, config.AES_KEY, config.AES_IV))
          if(fileObj.id === this.audioId){
            this.setState({state: 'audioIsDownloaded', value: true})
          }
        }
      })
    }).catch((err: any)=>{
        console.log('音频是否已下载：',err)
    })
  }

/**
 * 对本地文件对象进行组装,主要是赋予其的文件内存字节大小
 */
  @Action
  public async initDownloadedFile(){
    let list: any = await this.getDownloadedFile() || []
    for(let i=0; i<list.length; i++){
      let albumSize: any = 0
      let albumItem = list[i]
      let audioList = list[i].audioList
      for(let j=0; j<audioList.length; j++){
        let audioItem = audioList[j]
        let audioSize =await readFileSize(audioItem.link)
        albumSize += audioSize
        audioItem.audioSize = audioSize //赋予音频内存大小
      }
      albumItem.albumSize = albumSize //赋予专辑内存大小
    }
    return list
  }

  //本地下载好的文件存入state,无返回参数
  @Action
  public async getDownloadedFile(){
    //下载好的专辑文件
    let downloadedFileList: object[] = []
    //下载好的专辑图片
    let downloadedPosterList: object[] = []

    //读取本地专辑
    let albumList: any = await readFile() || []
    //读取本地专辑图片
    let posterList: any = await readFile('', 1) || []

    posterList.map(async (item: any)=>{
      //文件后缀不参与解密
      let fileName = item.name.substring(0,item.name.lastIndexOf('.'))
      let fileObj = await JSON.parse(decrypt(fileName, config.AES_KEY, config.AES_IV))
      fileObj.poster = item.fullPath
      downloadedPosterList.push(fileObj)
    })

    for(let i=0; i<albumList.length; i++){
      let albumItem = albumList[i]
      let targetAlbum: any = {}
      let albumId = Number(albumItem.name.substring(albumItem.name.lastIndexOf('-') + 1))

      if(albumId){
        //读取专辑文件名对应的音频文件
        let audioList: any = await readFile(albumItem.name) || []
        //配置专辑信息
        if(audioList.length > 0 ){ 
          //专辑id
          targetAlbum.id = albumId
          //专辑名
          targetAlbum.name = albumItem.name.substring(0, albumItem.name.lastIndexOf('-'))
          //专辑音频
          targetAlbum.audioList = []
          //专辑图片
          downloadedPosterList.map((posterItem: any)=>{
            if(posterItem.albumId === albumId){
              /** 使用的本地图片需得是平台绝对路径 **/
              targetAlbum.poster = `file://${posterItem.poster}`
            }
          })
  
          for(let j=0; j<audioList.length; j++){
            let audioItem = audioList[j]
            //文件后缀不参与解密
            let fileName = audioItem.name.substring(0,audioItem.name.lastIndexOf('.'))
            let fileObj = await JSON.parse(decrypt(fileName, config.AES_KEY, config.AES_IV))

            console.log('解密后的文件名:', fileObj)
            
            //专辑作者
            targetAlbum.author = fileObj.author
            //专辑播音
            targetAlbum.createBy = fileObj.createBy
            //专辑里的音频长度
            targetAlbum.total = fileObj.total

            //补充音频本地路径
            fileObj.link = audioItem.fullPath
            //补充音频图片
            fileObj.poster = targetAlbum.poster

            targetAlbum.audioList.push(fileObj)
          }
          //按section进行排序
          targetAlbum.audioList = tool.arrSort(targetAlbum.audioList, 'section')
      
          if(targetAlbum.audioList.length>0){
            downloadedFileList.push(targetAlbum)
          }  
        }
      }
    }

    //同步storage和vuex
    storage.setStorage('PlayModule', storage.keysObj.downloadedFileList, downloadedFileList)

    return downloadedFileList
  }

  //接口新增音频播放记录
  @Action
  public addRecordPlay(isNoChangeAudio?: boolean){
    let parames = {
      url: requestApi.api.recordPlay,
      data: { audioId: this.audioId}
    }
    requestHttp.http.post(parames.url, parames.data).then((res:any)=>{
      console.log('接口新增音频播放记录')
    })
  }

  //接口新增音频下载记录
  @Action
  public addRecordDownload(){
    let parames = {
      url: requestApi.api.recordDownload,
      data: { audioId: this.audioId }
    }
    requestHttp.http.post(parames.url, parames.data).then((res: any)=>{
      console.log('接口新增音频下载记录')
    })
  }

   //通知栏的原生插件-加载音频
   @Action
   public initSongs(snapFlag: boolean) {}

   //通知栏的原生插件-加载音频播放器
   @Action
   public initAudio() {
     // #ifdef H5
     h5Audio.init()
     // #endif

     // #ifdef APP-PLUS
     try {
       musicNotification.init()
     } catch (e) {
       throw new Error('初始化插件失败')
     }
     // #endif
   }

  //通知栏回调事件---上一首
  @Action
  public async last() {
    if(this.playMode === 0){  //0：使用网络资源 1：使用本地资源
      if(this.audioInfo.previousAudioId){
        this.setState({state: 'audioId', value: this.audioInfo.previousAudioId})
        await this.getAudioFromLink()
        this.resume()  //更新音频信息
      }else{
        uni.showToast({title: '已到顶，没有上一章节', icon: 'none'})
      }
    }else{
      this.cachePlay(-1)
    }
  }

  //通知栏回调事件---下一首
  @Action
  public async next() {
    if(this.playMode === 0){ //0：使用网络资源 1：使用本地资源
      if(this.audioInfo.nextAudioId){
        this.setState({state: 'audioId', value: this.audioInfo.nextAudioId})
        await this.getAudioFromLink()
        this.resume()  //更新音频信息
        //网络资源播放情况下开启集数倒计时，需确保下一首音频的资源信息更新后再触发 集数倒计时相关 事件
        this.reciprocal()
      }else{
        uni.showToast({title: '已到底，没有下一章节', icon: 'none'})
      }
    }else{
      this.cachePlay(+1)
    }
  }

  // 集数倒计时相关
  @Action 
  reciprocal(){
    if(this.openReciprocal){
      let num = this.reciprocalNum-1 
      this.setState({state: 'reciprocalNum', value: num})
      if(num<1){ //关闭定时
        this.setState({state: 'openReciprocal', value: false})
        setTimeout(()=>{
          this.setState({state: 'current_time', value: 0})
          //集数倒计完毕后的
          this.stop()
        },500)
      }
    }
  }

  //通知栏回调事件---设置倍速播放
  @Action
  public playbackRate(value: number) {
    audioController.playbackRate(value)
  }

  //通知栏回调事件---播放进度更改  second: 秒
  @Action
  public seek(second: number) {
    audioController.seek(second)
  }

  //音频与通知栏回调事件---停止播放
  @Action
  public stop() {
    audioController.stop()
    musicNotification.cancel()
    //plus.runtime.quit() //停止播放后退出app
  }

  //通知栏回调事件---收藏
  @Action
  public favour(favour: boolean) {
    musicNotification.openLockActivity(favour)
    //通知栏回调事件---切换音乐锁屏状态， true为开启锁屏
  }
  
  //打开通知栏
  @Action
  public openLockActivity(isLockActivity: boolean) {
    musicNotification.openLockActivity(isLockActivity)
  }

  //通知栏回调事件---设置桌面小部件风格
  @Action
  public setWidgetStyle(style: any) {
    musicNotification.setWidgetStyle(style)
  }

  //通知栏和音频模块的主要逻辑 - 音频及通知栏的初始化
  @Action
  public resume() {
    this.setState({state: 'timerCount', value: 0})
    if(this.once_play){
      this.setState({ state: 'once_play', value: false })
    }

    // #ifdef H5
    h5Audio.resume(this.audioInfo)
    h5Audio.playOrPause(true)
    return
    // #endif


    const callback = () => {
      this.setState({ state: 'isOpenNotification', value: true })
      // 通知栏更新
      let res = musicNotification.update({
        songName: this.audioInfo.title, //歌曲名字
        artistsName: this.audioInfo.name,			// //专辑名字
        favour: false, //搜藏poster
        //专辑图片
        picUrl: this.audioInfo.poster || 'static/logo.png',
      })
      switch (res.code) {
        case -1: //未知错误
          return
        case -2: //没有权限
          musicNotification.openPermissionSetting() //没有权限，跳转设置页面
          return
      }
      audioController.resume(this.audioInfo) //音频播放器初始化
    }

    if (this.isOpenNotification) {
      callback()
    } else {
      try {
        //音频事件监听
        audioController.init({
          play: () => {
            //图标 暂停=>播放
            if(!this.playing){
              this.setState({state: 'playing', value: true})
            }
            //音频总时长
            let duration = parseInt(String(audioController.duration()))
            this.setState({state: 'duration', value: duration})

            //历史开始播放
            if(this.isHistoryPlay){
              this.seek(this.current_time)
              this.setState({state: 'isHistoryPlay', value: false})
            }
          },
          pause: ()=>{
            //图标 播放=>暂停
            if(this.playing){
              this.setState({state: 'playing', value: false})
            }
            //音频暂停播放时，缓存当前的播放进度
            this.cacheCurrent_time()
          },
          end: () => {
            this.playOrPause(false)
            this.next()
          },
          error: (err: any) => {
            console.log('播放出错:', err)
            this.next()
          },
          waiting: (err: any)=>{//音频加载中事件，当音频因为数据不足，需要停下来加载时会触发
            setTimeout(()=>{
              this.playOrPause(true)
            },1000)
          },
          timeUpdate: () => {
            let currentTime = parseInt(String(audioController.currentTime()))
            if(currentTime >= this.duration){//当前播放进度不允许超过音频总时长
              currentTime = this.duration
            }
            if(!this.isHistoryPlay){
              if(this.current_time != currentTime){
                  //更新音频播放进度
                  this.setState({state: 'current_time', value: currentTime})
    
                  let count = this.timerCount + 1
                  this.setState({state: 'timerCount', value: count})
                  //每隔15秒缓存一次播放进度
                  if(this.current_time >= this.countTime && this.timerCount >= this.countTime){
                    this.cacheCurrent_time()
                  }
              }
            }
          },
        })

        //通知栏初始化
        let config = { 
          path: '/pages/play/index', //点击通知栏跳转页面
					icon: `file://${plus.io.convertLocalFileSystemURL('_www/static/logo.png')}`, // 状态栏图标,初始化时只能用本地图片的平台绝对路径，不然app会闪退
        }
        musicNotification.openNotification(config, callback)

        //通知栏回调事件注册
        const events = new Map();
        //执行暂停或播放事件
        events.set('musicNotificationPause', 'playOrPause');
        //播放上一首
        events.set('musicNotificationPrevious', 'last');
        //播放下一首
        events.set('musicNotificationNext', 'next');
        //收藏
        events.set('musicNotificationFavourite', 'favour');

        plus.globalEvent.addEventListener('musicNotificationPause', (e: any) => {
          console.log('通知栏：暂停或播放')
          this.playOrPause(!this.playing) 
        })
        plus.globalEvent.addEventListener('musicNotificationPrevious', (e: any) => {
          console.log('通知栏：上一首')
          this.last()
        })
        plus.globalEvent.addEventListener('musicNotificationNext', (e: any) => {
          console.log('通知栏：下一首')
          this.next()
        })
        plus.globalEvent.addEventListener('musicNotificationFavourite', (e: any) => {
          
        })
      } catch (e) {
        throw new Error('初始化播放器失败')
      }
    }
  }
}

export const PlayModule = getModule(Play)
