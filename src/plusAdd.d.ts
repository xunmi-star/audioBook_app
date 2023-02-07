/* 为plus.d.ts做类型注解补充 - being */
type addEventListener = {
  addEventListener(event?: 'touchstart' | 'touchmove' | 'touchend' | 'click' | 'musicNotificationPause' | 'musicNotificationPrevious' | 'musicNotificationNext' | 'musicNotificationFavourite', listener?: (result: any) => void, capture?: boolean): void;
}

type PlusIoGetFileInfo = {
  /**
   * 文件键名
   * 支持以下类型路径：
    相对路径 - 访问相对于当前页面host位置资源，如"a.mp3"
    相对路径URL - 访问5+ API定义的应用沙盒目录， 参考：plus.io.RelativeURL
    本地绝对路径URL - 访问应用沙盒目录外其它系统资源目录， 参考：plus.io.LocalURL
   * 
   * 参考: [https://www.html5plus.org/doc/zh_cn/io.html#plus.io.getFileInfo)
   */
   filePath?: string;
   /**
    * 支持以下类型路径：计算文件摘要的算法
    * 可取值： "md5" - 使用md5算法计算摘要信息； "sha1" - 使用sha1算法计算摘要信息。 默认值为"md5"。
    */
   digestAlgorithm?: string;
   /**
    *  获取文件信息成功回调函数
    * result属性
       result.digest: (String 类型 )文件摘要
        按照传入的 digestAlgorithm 计算得出的文件摘要信息。

        result.size: (Number 类型 )文件大小
        单位为字节。
    */
   success?: (result: any) => any;
   /**
    * 可选 获取文件信息失败回调函数
    * error: 回调参数，错误信息
      可通过error.code（Number类型）获取错误编码； 可通过error.message（String类型）获取错误描述信息。
    */
   fail?: (error: any) => any;
   /**
    * 获取文件信息操作完成回调函数
    * event: ( Object ) 回调参数
      调用成功时回调参数与IOSuccessCallback一致，调用失败时回调参数与IOFailCallback一致。
    */
   complete?: (Object: any) => any;
}

interface Plus {
  globalEvent: addEventListener;
}

interface PlusIo {
  convertLocalFileSystemURL(url?: '_www/' | '_doc/' | '_documents/' | '_downloads/' | '_www/static/logo.png' | string): string;
  resolveLocalFileSystemURL(url?: '_www/' | '_doc/' | '_documents/' | '_downloads/' | string, succesCB?: (result: PlusIoDirectoryEntry) => void, errorCB?: (result: any) => void): void;
  getFileInfo(options?: PlusIoGetFileInfo): void;
}

interface PlusNavigator {
  setStatusBarStyle(style?: 'dark' | 'light' | string): void;
}

/* 为plus.d.ts做类型注解补充 - end */