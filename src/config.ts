// vuex持久化
let preserveState = false
 // #ifdef H5
 preserveState = localStorage.getItem('vuex') !== null
 // #endif

//下载任务对象的键名前缀
const Dtask = 'dtask'

//本地文件根路径
const BaseFile = '_doc/'  
//专辑文件夹
const AlbumFile = 'album/'
//专辑图片文件夹
const ImgFile = 'img/'


// 数据加密-秘钥
const AES_KEY = 'e4ea89835ad64eb1b8d76069e33908d4'
// 数据加密-偏移量
const AES_IV = 'ff465fdecc764337'
// 数据加密-加盐字符串
const AES_ADD_KEY = 'hujiehongwei'


export default {
  preserveState,
  Dtask,
  BaseFile,
  AlbumFile,
  ImgFile,
  AES_KEY,
  AES_IV,
  AES_ADD_KEY
}
