import { PlayModule } from '@/store/modules/play'
import { UserModule } from '@/store/modules/user'
import { SeetingModule } from '@/store/modules/seeting'

const moduleObj: any = {
  PlayModule,
  UserModule,
  SeetingModule
}

const keysObj = {
  //账号相关
  token: 'token',//登陆相关操作需用到的token
  accountInfo: 'accountInfo',//账号详情
  userInfo: 'userInfo',//用户详情
  userExpandInfo: 'userExpandInfo',//用户拓展信息

  //系统配置相关
  theme: 'theme',//配置主题相关

  // 音频相关
  cacheList: 'cacheList',//音频播放记录

  // 本地文件相关
  downloadQueue: 'downloadQueue',//下载队列
  cacheAlbumList: 'cacheAlbumList',//本地下载过的专辑列表
  cacheAudioList: 'cacheAudioList',//本地下载过的音频列表
  downloadedFileList: 'downloadedFileList',//本地已经下载的专辑列表(含音频)

}

/**
 * 将要缓存的内容存入vuex和Storage
 * @param store 对应的模块,如PlayModule
 * @param key 对应模块的键
 * @param value 对应模块的值
 */
export const setStorage = function(store: string, key: string, value: any){
  uni.setStorageSync(key, value)
  
  moduleObj[store].setState({state: key, value: value})

}




export default{
  keysObj,
  setStorage
}