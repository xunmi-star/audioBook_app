import config from "@/config"
//导入加密，解密函数
import {encrypt, decrypt} from "@/utils/encryp"

import storage from '@/utils/storage'

import { PlayModule } from '@/store/modules/play'


/**
 * 检索现有目录，如果尚不存在，则创建它
 * @param fileName {string} 要检索的文件名（默认是检索专辑文件夹）
 * @param fileState {number} 要检索的文件类型 
 *                  0.检索专辑文件(默认情况) 1.检索专辑封面文件
 * @returns 
 */
export function createDirectory(fileName: string='', fileState: number=0) {
  return new Promise((resolve, reject) => {
      plus.io.resolveLocalFileSystemURL(config.BaseFile, function (entry) {
        let arr = [config.AlbumFile, config.ImgFile]
        let path = arr[fileState]
        //指定检索具体的某一个专辑文件夹
        if(fileName && fileState===0){ 
          path += `${fileName}` 
        }
        entry.getDirectory( path, {create: true, exclusive: false}, function( dir ){
            resolve(`创建打开目录${path}成功`)
        }, function () {
            reject(`创建打开目录${path}失败`) 
        } );
      })
  })
}

/**
 * 根据路径读取文件的字节大小
 * @param fullPath 文件路径(平台绝对路径)
 * @returns 文件的字节大小
 */
 export const readFileSize = function(fullPath: string){
  return new Promise((resolve, reject)=>{
    plus.io.getFileInfo({filePath: fullPath, success: function(info: any){
      resolve(info.size)
    }, fail: function(err){
      reject(err)
    }});
  })
}

/**
 *读取下载的文件
 @param fileName 专辑名-专辑id 有fileName参数时表示读取专辑下的音频， 没有参数时表示读取所有的专辑
* @param fileState {number} 要检索的文件类型 
 *                  0.检索专辑文件(默认情况) 1.检索专辑封面文件
 */
export const readFile = function(fileName: string='', fileState: number=0){
  return new Promise((resolve, reject)=>{
    let arr = [config.AlbumFile, config.ImgFile]
    createDirectory(fileName, fileState).then((res: any)=>{ 
      let path = config.BaseFile + arr[fileState]
      if(fileName && fileState===0){ 
        path += `${fileName}` 
      }

      plus.io.resolveLocalFileSystemURL(path, function (entry) {
          let directoryReader = entry.createReader()
          //读取这个专辑目录下的所有文件
          directoryReader.readEntries(
              function (entries: any) {
                if(fileName){//有专辑名，就读取文件的内存大小
                  if(entries.length < 1){//该专辑未下载过音频
                    resolve(entries)
                  }
                  entries.map((item: any, index: number)=>{
                    plus.io.getFileInfo({filePath: item.fullPath, success: function(info){
                      item.fileSize = info.size
                      if(entries.length-1 === index){
                        resolve(entries)
                      }
                    }});
                  })
                }else{//没有专辑名，表示读取所有的专辑
                  resolve(entries)
                }
              },
              function (err: any) {
                reject(`文件读取失败`)
              },
          )
      }, function (err: any) {
        reject(`读取err：${err}`)
      })
    })
  })
}

/**
 * 资源是否为重复下载 true
 * @param folderName 文件夹路径名
 * @param filePath 文件路径名
 * @param fileState {number} 要检索的文件类型 
 *                  0.检索专辑文件(默认情况) 1.检索专辑封面文件
 * @return 
 *    noRepeat  true: 未重复  false：已经重复
 *    isKeepOn  true: 继续下载  false：不继续下载
 */
export const repeatDownload = async function(folderName: string, filePath: string, fileState: number=0){
  //不重复
  let noRepeat = true
  //继续下载
  let isKeepOn = false 

  //读取专辑下的音频文件
  let fileList: any = await readFile(folderName, fileState)  || []
  // console.log('读取专辑下的音频文件')
  if(fileList.length>0){
    //读取到的图片or音频文件对象
    let targetFile: any = {}
    //未解密的音频文件名(含文件格式后缀)
    let fileName = ''
    fileList.map((item: any)=>{
      //本地文件的后缀不参与判定
      fileName = item.name.substring(0,item.name.lastIndexOf('.'))
      // 匹配到的音频文件
      if(fileName && filePath === fileName){
        targetFile = item
      }
    })

    //有匹配到音频文件
    if(Object.keys(targetFile).length>0){
      noRepeat = false
      let parseAudio = JSON.parse(decrypt(targetFile.name, config.AES_KEY, config.AES_IV))
      let targetFilePath = `${config.BaseFile}${config.AlbumFile}${folderName}/${targetFile.name}`
      let audioSize: any = await readFileSize(plus.io.convertLocalFileSystemURL(targetFilePath))
      console.log('读取的文件大小:',parseAudio.title,audioSize, parseAudio.size)
      //继续下载（已经下载的文件大小 < 从接口获取的文件大小）
      if(audioSize < parseAudio.size){
        isKeepOn = true
      }
      return {noRepeat: noRepeat, isKeepOn: isKeepOn}
    }else{
      return {noRepeat: noRepeat, isKeepOn: isKeepOn}
    } 
  }else{
    //没有该专辑
    return {noRepeat: noRepeat, isKeepOn: isKeepOn}
  } 
}

//枚举任务初始化，首次进入app时调用（将所有下载队列中没有的任务全部移除）
export const initDtask = function(){
  //手动同步storage与vuex的数据
  PlayModule.setState({state: storage.keysObj.downloadQueue, value: uni.getStorageSync(storage.keysObj.downloadQueue) || []})
  let downloadQueue = PlayModule.downloadQueue
  
  plus.downloader.enumerate(function(tasks){
    //没有任何专辑，直接移除全部枚举任务
    if(downloadQueue.length<1){
      plus.downloader.clear()
    }

    downloadQueue.map((albumItem: any, albumIndex: number)=>{
      albumItem.audioList.map((audioItem: any, audioIndex: number)=>{
        let tasksList = tasks || []
        let identicalDtaskArr: object[] = [] //一个音频可能同时存在多个枚举任务
        let targetDtask: any = {}
        let targetAudio: any = {}
        let targetAudioIndex: number = -1 

        console.log('当前下载队列的音频:',audioItem.title)


        tasksList.map((item: any)=>{
          if(audioIndex===0){
            console.log('存在的枚举任务:',item)
          }
          //截取枚举的文件名
          let audioFileName =  item.filename.substring(item.filename.lastIndexOf('/')+1, item.filename.lastIndexOf('.'))
          //解密枚举的文件名
          let parseAudio = JSON.parse(decrypt(audioFileName, config.AES_KEY, config.AES_IV))
          // 枚举任务为图片时，退出这一轮的循环
          if(parseAudio.isImg){ return }
          

          //如果此任务已经下载完毕，则将此枚举任务移除
          if(item.downloadedSize !== 0 && item.downloadedSize >= item.totalSize){
            console.log('此任务已经下载完毕,准备移除:',parseAudio.title)
            item.abort()
            return
          }

          if(albumItem.id === parseAudio.albumId && audioItem.id === parseAudio.id){
            console.log('与音频id相同的枚举任务:',parseAudio.title, item)
            identicalDtaskArr.push(item)
          }
        })

        console.log('重复任务数组:',audioItem.title, identicalDtaskArr.length, identicalDtaskArr)
        /** 该音频可能存在多个枚举任务，这种情况下，已downloadedSize(已经下载的)值大的为主，且移除其它任务后退出此轮循环**/
        if(identicalDtaskArr.length>0){
          identicalDtaskArr.map((item: any)=>{
            console.log('大小比较：',targetDtask.downloadedSize, item.downloadedSize)
            if(Object.keys(targetDtask).length>0){
              //当前任务 < 遍历的重复任务 且 重复任务没有下载完毕，移除当前任务
              if(targetDtask.downloadedSize < item.downloadedSize && item.downloadedSize < item.totalSize){
                console.log('移除targetDtask任务')
                targetDtask.abort()

                targetDtask = item
                targetAudio = audioItem
                targetAudioIndex = audioIndex 
              }else{
                console.log('移除重复数组的item任务')
                item.abort()
              }
            }else{
              targetDtask = item
              targetAudio = audioItem
              targetAudioIndex = audioIndex
            }
          })
        }
  
        //如果下载队列里有此音频，就将其下载状态改为5（暂停）
        if(Object.keys(targetAudio).length>0){
          /** 一个音频可能会同时存在多个任务(甚至会出现两个除了任务id不同，其它参数完全一致的情况，这种情况在音频下载完毕后
           * 会直接移除任务，故对流程没啥影响)，此时与下载队列中的已经下载进度不同则将此任务移除 **/
          console.log('首页准备暂停的任务:',targetDtask.state, targetAudio)
          targetAudio.isDownloading = false
          targetAudio.downloadState = 5

          let potions = {
            state: 'downloadQueue',
            index: albumIndex,
            arrObj: 'audioList',
            keyOrIndex: targetAudioIndex,
            value: targetAudio,
          }

          //修改单个音频的在下载队列中的属性
          PlayModule.setStateArrObj(potions)
          //同步vuex与stora
          storage.setStorage('PlayModule', 'downloadQueue', PlayModule.downloadQueue)
        }
      })

    })
  })
}

/**
 * 从枚举任务中移除的同时，同时也从下载队列，下载任务监听函数键名数组中移除
 * @param parames 
 *    albumInfo 专辑信息
 *    audioList 音频列表
 *    isHandAbort   是用户手动取消的下载任务，此时需要弹窗提示
 */
export const removeDownloadDtask = function(parames: any){
  console.log('从枚举任务中移除的同时，同时也从下载队列，下载任务监听函数键名数组中移除入参数：',parames)
  plus.downloader.enumerate(function(tasks){
    let tasksList = tasks || []
    //枚举任务长度为0时，直接从下载队列移除就好
    if(tasksList.length<1){
      PlayModule.addOrRemoveQueue(parames)
      return
    }

    if(parames.isHandAbort){
      uni.showModal({
        title: '取消下载',
        content: '此操作会连同已经下载了部分的本地文件一起删除',
        success: function (res) {
          if (res.confirm) {
            startRemove()
          } else if (res.cancel) {
            console.log('用户点击取消');
          }
        }
      });
    }else{
      startRemove()
    }

    function startRemove(){
      //移除其存在vuex里的监听函数键名
      let dtaskListenKeyArr = PlayModule.dtaskListenKeyArr
      dtaskListenKeyArr.map((item: any, index: number)=> {
        let itemAlbumId = item.substring(item.indexOf('_')+1, item.lastIndexOf('_'))
        let itemAudioId = item.substring(item.lastIndexOf('_')+1)
        console.log('进入目标函数:',itemAlbumId,itemAudioId)
        //单个移除
        if(parames.audioList.length==1 && itemAlbumId == parames.albumInfo.id && itemAudioId == parames.audioList[0].id){
          console.log('移除单个监听函数键名',index)
          dtaskListenKeyArr.splice(index, 1)
          PlayModule.setState({state: 'dtaskListenKeyArr', value: dtaskListenKeyArr})
        }
        //按专辑批量移除
        if(parames.audioList.length>1 && itemAlbumId == parames.albumInfo.id){
          console.log('移除多个监听函数键名:',index)
          dtaskListenKeyArr.splice(index, 1)
          PlayModule.setState({state: 'dtaskListenKeyArr', value: dtaskListenKeyArr})
        }
      })

      tasksList.map((item: any)=>{
        //截取枚举的文件名
        let audioFileName =  item.filename.substring(item.filename.lastIndexOf('/')+1, item.filename.lastIndexOf('.'))
        //解密枚举的文件名
        let parseAudio = JSON.parse(decrypt(audioFileName, config.AES_KEY, config.AES_IV))
        // 枚举任务为图片时，退出这一轮的循环
        if(parseAudio.isImg){ return }
        //枚举任务中有次音频，则将其移除
        let targetAudio = parames.audioList.find((audioItem: any) => parames.albumInfo.id === parseAudio.albumId && audioItem.id === parseAudio.id)
        if(targetAudio && Object.keys(targetAudio).length>0){
          console.log('准备取消的任务:',targetAudio.title)
          //对于正在下载中的任务，需先暂停后在取消(不先暂停的话，监听函数会把最新的音频信息更新进下载队列中)
          if(item.state === 3){
            item.pause()
          }
          item.abort()

          //此处的延时函数是为了确保监听函数移除完毕，预防其更新数据到vuex
          setTimeout(()=>{
            PlayModule.addOrRemoveQueue(parames)
            //继续其它的下载任务
            PlayModule.runDownloadQueue({})
          },500)
        }
      })
    }
  })
}

/**
 * 下载专辑图片
 * @param info 
 *     name: 专辑名
 *     albumId: 专辑id
 *     link: 下载链接
 */
export const downloadImg = async function(info: any){
  let snapObj: any = {
    name: info.name,
    albumId: info.albumId,
    isImg: true
  }
  //图片文件夹名称  例：_doc/img
  let folderName = config.BaseFile + config.ImgFile
  
  //图片文件名
  let fileName = `${snapObj.name}_${snapObj.albumId}`
  //图片的格式后缀
  let fileType = info.link.substring(info.link.lastIndexOf('.'))
  //加密后的图片文件名
  let encryptStr = encrypt(JSON.stringify(snapObj), config.AES_KEY, config.AES_IV)
  //完整的图片路径
  let path = folderName + encryptStr + fileType

  let resFlag: any = await repeatDownload(folderName, encryptStr, 1)
  //已经存在部分下载的文件，从枚举任务和本地文件中将其删除
  if(resFlag.isKeepOn){
    plus.downloader.enumerate(function(tasks){
      let tasksList = tasks || []
      tasksList.map((item: any)=>{
        //截取枚举的文件名
        let imgFileName =  item.filename.substring(item.filename.lastIndexOf('/')+1, item.filename.lastIndexOf('.'))
        if(encryptStr === imgFileName){
          item.abort()
          removeFile([{link: item.filename}])

          // @ts-ignore: Unreachable code error
          let DownLoadObj = plus.downloader.createDownload(info.link, { filename: path}, function(d, status){})
          DownLoadObj.start()
        }
      })
    })
  }
  //本地此专辑图片相关的文件，直接下载
  if(resFlag.noRepeat && !resFlag.isKeepOn){
    // @ts-ignore: Unreachable code error
    let DownLoadObj = plus.downloader.createDownload(info.link, { filename: path}, function(d, status){})
    DownLoadObj.start()
  }
}

/**
 * 添加音频下载任务
 * audioInfo是接收的音频信息
 * @param info 下载信息
 *    albumInfo 专辑信息
 *    audioInfo 音频信息
 *    isSpecialLoading {boolean} true 特殊情况-允许单个音频从等待中状态直接下载的标志
 * 下载好的文件路径形式  _doc/album/最后一个道士-2/第一集-914
 * 注意： 一.文件名称长度不可超过 255 个字节
 *        二.继续下载需多重判定 
 *          1.枚举的任务列表中是否已经创建过此任务(刚需)  
 *          2.检测本地文件是否有已经下载了部分的文件 
 * 
 */
export const addDownloadDtask = async function(info: any){
  console.log('进入添加下载任务函数:',info.isSpecialLoading, info.audioInfo.title)

  return new Promise(async (resolve, reject)=>{
    //WHY 此时vuex里的数据与storage不同步，就很奇怪
    PlayModule.setState({state: storage.keysObj.downloadQueue, value: uni.getStorageSync(storage.keysObj.downloadQueue) || []})
    
    //需要用到的属性
    let audioInfo: any = {
      albumId: info.albumInfo.id,//albumId 专辑id
      name: info.albumInfo.name,//name 专辑名
      author: info.albumInfo.author,//作者
      createBy: info.albumInfo.createBy, //播音
      total: info.albumInfo.total, //专辑总的音频长度

      id: info.audioInfo.id,//id 音频id
      link: info.audioInfo.link,//link 下载链接
      title: info.audioInfo.title,//title 音频名
      size: info.audioInfo.size,//size 音频文件大小
      section: info.audioInfo.section,//音频排序位置
      previousAudioId: info.audioInfo.previousAudioId,//上一首的音频id
      nextAudioId: info.audioInfo.nextAudioId,//下一首的音频id
    }
  
    //专辑文件夹名称  例：最后一个道士-2
    let albumFile = `${audioInfo.name}-${audioInfo.albumId}`

    //配置文件名需加密的音频信息
    let snapObj = {
      albumId: audioInfo.albumId,
      author: audioInfo.author,
      createBy: audioInfo.createBy, 
      total: audioInfo.total, 
      id: audioInfo.id,
      title: audioInfo.title,
      size: audioInfo.size,
      section: audioInfo.section,
      previousAudioId: audioInfo.previousAudioId,
      nextAudioId: audioInfo.nextAudioId,
    }

    //加密后的音频文件名
    let encryptStr = encrypt(JSON.stringify(snapObj), config.AES_KEY, config.AES_IV)
    
    let audioFilePath = `${config.BaseFile}${config.AlbumFile}` + `${albumFile}/` + `${encryptStr}`
  
    let fileType = audioInfo.link.substring(audioInfo.link.lastIndexOf('.'))

    //下载方式判定
    let resFlag: any = await repeatDownload(albumFile, encryptStr)
      //任务对象
    let DownLoadObj: any = {}
    let filename: string = audioFilePath + fileType

    plus.downloader.enumerate(function(tasks){
      let tasksList = tasks || []
      //从枚举的任务中查找有无此音频
      tasksList.map((item: any)=>{
        if(filename === item.filename){
          DownLoadObj = item
        }
      })
      //枚举中已经存在此任务，继续下载
      if(Object.keys(DownLoadObj).length>0){
        resolve({state: 'success', data: {info, filename}})
      }

      //枚举中不存在此音频任务
      if(Object.keys(DownLoadObj).length<1){
        /** 枚举中没有此任务，但已经下载了部分音频，则将本地文件删除后,更改其在下载队列中的状态为5且之后也要新建下载任务且 **/
        removeFile([{link: DownLoadObj.filename}])

        if(resFlag.isKeepOn){
          PlayModule.downloadQueue.map((albumItem: any, albumIndex: number)=>{
            if(albumItem.id === info.albumInfo.id){
              albumItem.audioList.map((audioItem: any, audioIndex: number)=>{
                if(audioItem.id === info.audioInfo.id){
                  audioItem.downloadState = 5
                  let potions = {
                    state: 'downloadQueue',
                    index: albumIndex,
                    arrObj: 'audioList',
                    keyOrIndex: audioIndex,
                    value: audioItem,
                  }
                  //修改单个音频的在下载队列中的属性
                  PlayModule.setStateArrObj(potions)
                  //同步vuex与stora
                  storage.setStorage('PlayModule', 'downloadQueue', PlayModule.downloadQueue)
                }
              })
            }
          })
        }

        //该任务已经下载完毕
        if(!resFlag.isKeepOn && !resFlag.noRepeat){
          // 从下载队列和枚举任务中将其移除
          let parames = {
            albumInfo: info.albumInfo,
            audioList: [info.audioInfo],
          }
          removeDownloadDtask(parames)
          PlayModule.addOrRemoveQueue(parames)

          resolve({state: 'err', msg: `本地已存在${info.audioInfo.title},下载失败`})
        }

        //本地没有此音频相关的文件，需新建下载任务
        if(!resFlag.isKeepOn && resFlag.noRepeat){
          console.log(`新建${DownLoadObj.isSpecialLoading?'-特殊-':''}音频任务`,snapObj.title)
          // @ts-ignore: Unreachable code error
          DownLoadObj = plus.downloader.createDownload(audioInfo.link, { filename: filename}, function(d, status){})
          DownLoadObj.isSpecialLoading = info.isSpecialLoading
          resolve({state: 'success', data: {info, filename}})
        }
      }
    })
  })
}

/**
 * 枚举下载任务
 */
export const enumerateDwonload = function(){
  let downloadQueue = (uni as any).$u.deepClone(PlayModule.downloadQueue || [])

   //监听状态码变为4的情况，只允许触发一次
   let stateIsFourIsOnce = true 

  //枚举下载任务
  plus.downloader.enumerate(function(tasks){
    let tasksList = tasks || []

    let audioFileName = ''
    let targetDtask: any = {}
    let targetAlbum: any = {}
    let targetAudio: any = {}
    
    tasksList.map((item: any)=>{
      // 有准备下载的任务时且此任务不是特殊情况时，退出这一轮的循环  
      if(Object.keys(targetDtask).length>0 && !item.isSpecialLoading){ return }

      //截取枚举的文件名
      audioFileName =  item.filename.substring(item.filename.lastIndexOf('/')+1, item.filename.lastIndexOf('.'))
      
      //解密枚举的文件名
      let parseAudio = JSON.parse(decrypt(audioFileName, config.AES_KEY, config.AES_IV))
      
      // 枚举任务为图片时，退出这一轮的循环
      if(parseAudio.isImg){ return }
    
      //按照任务队列和下载队列依次下载
      downloadQueue.map((albumItem: any, albumIndex: number)=>{
        if(albumItem.id === parseAudio.albumId){
          albumItem.audioList.map((audioItem: any, audioIndex: number)=>{
            if(audioItem.id === parseAudio.id && audioItem.isDownloading){
              targetDtask = item
              targetAlbum = albumItem
              targetAudio = audioItem
              return
            }
          })
          if(Object.keys(targetDtask).length>0){
            return
          }
        }
      }) 
    })

    /** 预防一个音频可能同时存在多个监听函数的情况
     * 创建枚举任务后，将其存入vuex,但不存入storage(确保重新进入app时重置数组)
     * 在vuex中没有此监听函数的情况下才允许创建监听函数 **/

    let dtaskListenKey = `${config.Dtask}_${targetAlbum.id}_${targetAudio.id}`
    let hasKey = PlayModule.dtaskListenKeyArr.includes(dtaskListenKey)

    //有枚举任务且不存在监听函数，才允许新建下载监听函数
    if(Object.keys(targetDtask).length>0 && !hasKey){ 
      console.log('创建下载监听函数：',targetAudio.title)
      //监听下载任务状态发生变化
      let count = 0
      //将准备创建的监听函数标志存入vuex
      PlayModule.dtaskListenKeyArr.push(dtaskListenKey)

      let listenParames = {
        targetDtask, targetAlbum, targetAudio, dtaskListenKey
      }
      buildDtaskListen(listenParames)
    }

    console.log('数据传输之前:',targetAudio.isDownloading, targetDtask.state, targetAudio)
    if(Object.keys(targetAudio).length>0 && targetAudio.isDownloading){
      //暂停其它下载任务
      plus.downloader.enumerate(function(tasks){
        let tasksList = tasks || []
        tasksList.map((stopItem: any)=>{
          let stopAudioFileName =  stopItem.filename.substring(stopItem.filename.lastIndexOf('/')+1, stopItem.filename.lastIndexOf('.'))
          //解密枚举的文件名
          let stopParseAudio = JSON.parse(decrypt(stopAudioFileName, config.AES_KEY, config.AES_IV))
          // 枚举任务为图片时，退出这一轮的循环
          if(stopParseAudio.isImg){ return }

          if(audioFileName !== stopAudioFileName){
            PlayModule.editDtaskStopArr({albumId: stopParseAudio.albumId, audioId: stopParseAudio.id})
          }
        })

        //开启下载任务
        if(targetDtask.state === 2 || targetDtask.state === 3){
          console.log('继续下载')
          targetDtask.resume()
        }else{
          console.log('常规下载')
          targetDtask.start()
        }
      })

    }
	});
}

/**
 * 创建下载任务监听函数
 * @param parames 
 *      targetDtask   待操作下载任务
 *      targetAlbum   待操作的专辑
 *      targetAudio   待操作的音频
 *      dtaskListenKey 监听函数在vuex数组里的键名
 */
export const buildDtaskListen = function(parames: any){
  let targetAlbumIndex = -1
  let targetAudioIndex = -1
  let {targetDtask, targetAlbum, targetAudio, dtaskListenKey} = parames

  targetDtask.addEventListener("statechanged", function(download: any, state: number){
    if(state === 200){
      //下载任务接收数据
      if(download.state === 3){
        // 更改音频进度条
        targetAudio.totalSize = Number(download.totalSize)
        targetAudio.downloadedSize = Number(download.downloadedSize)
        targetAudio.downloadState = download.state
  
        /** targetAlbumIndex和targetAudioIndex必须确保是最新数据 **/
        PlayModule.downloadQueue.map((albumItem: any, albumIndex: number)=>{
          if(albumItem.id === targetAlbum.id){
            albumItem.audioList.map((audioItem: any, audioIndex: number)=>{
              if(audioItem.id === targetAudio.id){
                targetAlbumIndex = albumIndex
                targetAudioIndex = audioIndex
              }
            })
          }
        })
  
        let potions = {
          state: 'downloadQueue',
          index: targetAlbumIndex,
          arrObj: 'audioList',
          keyOrIndex: targetAudioIndex,
          value: targetAudio,
        };
  
        // (uni as any).$u.throttle(function(){
        //   console.log('待同步进度的专辑，音频索引:',targetAlbumIndex, targetAudioIndex)
        // }, 1000)
  
        //修改单个音频的在下载队列中的属性
        PlayModule.setStateArrObj(potions)
        //同步vuex与stora
        storage.setStorage('PlayModule', 'downloadQueue', PlayModule.downloadQueue)
      }
  
      //下载任务已完成，此状态可能会触发多次,这里只允许它触发一次
      if(download.state === 4){
        //下载成功后，监听函数会自动将此任务从枚举任务中移除，
        //这里为了预防特殊情况()，手动触发一次移除枚举任务的函数
        removeDownloadDtask({albumInfo: targetAlbum, audioList: [targetAudio]})
  
        //将其从下载队列移除
        let removeInfo = {
          albumInfo: targetAlbum,
          audioList: [targetAudio],
          isAdd: false
        }
        PlayModule.addOrRemoveQueue(removeInfo)
  
        //移除其存在vuex里的监听函数键名
        let dtaskListenKeyArr = PlayModule.dtaskListenKeyArr
        let removeIndex = dtaskListenKeyArr.findIndex((findItem: any)=> findItem === dtaskListenKey)
        if(removeIndex>-1){
          dtaskListenKeyArr.splice(removeIndex, 1)
          PlayModule.setState({state: 'dtaskListenKeyArr', value: dtaskListenKeyArr})
        }
  
        //单个音频下载成功后的事件处理
        let afterParames = {
          albumInfo: targetAlbum,
          audioInfo: targetAudio,
        }
        PlayModule.afterDownload(afterParames)
  
        //手动移除监听函数（防止targetAudioIndex混乱导致的编辑器报错）
        targetDtask.addEventListener = null
  
        //准备下载其它任务
        PlayModule.runDownloadQueue({})
      }
    }
  })
} 

/**
 * 删除资源文件
 * pathList  被删除的资源路径
 */
export const removeFile = function (pathList: object[]){
  return new Promise((resolve: any, reject: any) => {
    pathList.map((item: any)=>{
      plus.io.resolveLocalFileSystemURL(item.link, function (entry) {
        //删除单个的文件
        entry.remove(
            function (res: any) {
              console.log('删除成功:',res)
              resolve('删除成功')
            },
            function (err: any) {
              console.log('删除失败:',err)
              reject(err)
            }
        )
      })
    })
  })
}

/**
 * 删除资源文件夹内的所有文件，但不会删除文件夹本身
 * folder  被删除的文件夹名字
 */
export const removeFolder = function (folder: string){
  return new Promise((resolve: any, reject: any) => {
    let path = plus.io.convertLocalFileSystemURL(config.BaseFile + config.AlbumFile + folder)
    plus.io.resolveLocalFileSystemURL(path, function (entry) {
      entry.removeRecursively(
          function (res: any) {
            console.log('文件夹删除成功:',res)
            resolve('文件夹删除成功')
          },
          function (err: any) {
            console.log('删除失败:',err)
            reject(err)
          }
      )
    })
  })
}
