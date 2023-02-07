## 介绍

本插件是android原生插件，仅支持Android app版本的 uni-app 项目使用。

本插件适配 android 4.1 以上

本插件的使用方法在插件包里的 app.vue、musicNotification.vue、audioController.js 有详细使用说明

##插件链接
https://ext.dcloud.net.cn/plugin?id=3476

## 方法：

- init( Object，Funcion ); 初始化通知栏 

- update(Object); 更新通知栏信息

- playOrPause(Object); 切换播放状态

- openLockActivity(Object); 切换锁屏状态

- cancel(); 移除通知栏

- openPermissionSetting()  打开通知栏权限页面

- initSongs( Funcion ) 获取本地音乐

- setWidgetStyle( Object ) 设置桌面小部件风格 **2.0.6 新增**

  

##### 2.0.5 废弃的接口 改用 plus.globalEvent.addEventListener进行回调

- ~~playOrPauseCallback( Funcion ) 播放按钮点击事件回调~~

- ~~lastCallback( Funcion ) 上一首按钮点击事件回调~~

- ~~nextCallback( Funcion ) 下一首按钮点击事件回调~~

- ~~favourCallback( Funcion ) 收藏按钮点击事件回调~~

##### 2.0.5回调监听

| 类型                       | 说明               |
| -------------------------- | ------------------ |
| ~~initMusicNotification~~  | 初始化回调         |
| musicNotificationPause     | 播放按钮事件回调   |
| musicNotificationPrevious  | 上一首按钮事件回调 |
| musicNotificationNext      | 下一首按钮事件回调 |
| musicNotificationFavourite | 收藏按钮事件回调   |

  例：

  ```javascript
  plus.globalEvent.addEventListener('musicNotificationPause', function(e) {
      //初始化回调
  });
  ```

  详情请看：audioController.js

##### 隐藏搜藏按钮：

  请打开 manifest.json -> 原生插件配置 -> musicNotification -> favour 内填写**`true（开启）`**或者**`false`**（关闭），不支持动态改变

## 注意：

开启锁屏页， 因为各个手机品牌对该功能的限制不同，所以要根据自己的需求调整。比喻小米手机，需要用户手动开启”开启锁屏显示“、”后台弹出界面“这两个权限才可以。

## 关于原生插件使用方法 ：

[官方文档](https://uniapp.dcloud.io/api/extend/native-plugin)
