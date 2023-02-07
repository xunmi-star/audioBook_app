export default (function () {
	//获取 android 原生插件
	let musicNotification: any
	class MusicNotification {
		/**
		 * 初始化方法
		 * @param {Object} config { path, icon, playing, lock }
		 * @param {Function} callback
		 */
		init() {
			if(!musicNotification){
				musicNotification = uni.requireNativePlugin('musicNotification');
			}
		}
		
		/**
		 * 获取本地音乐
		 * @param {Function} callback [ songData ]
		 * songData 的格式
		 * {
		 *		id: cursor.getInt(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)),			 //ID
		 *		audioName: cursor.getString(cursor.getColumnIndex(MediaStore.Audio.Media.TITLE)),		 //歌名
		 *		audioArtist: cursor.getString(cursor.getColumnIndex(MediaStore.Audio.Media.ARTIST)),	 //歌手
		 *		musicAlbum: cursor.getString(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM)),//专辑
		 *		musicAlbumID: cursor.getInt(cursor.getColumnIndex(MediaStore.Audio.Media.ALBUM_ID)),	 //专辑ID
		 *		audioImg: '',																		 //专辑图片路径
		 *		audioPath: cursor.getString(cursor.getColumnIndex(MediaStore.Audio.Media.DATA)),		 //路径
		 *		musicYear: cursor.getString(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.YEAR)),	 //发布年份
		 *		musicDuration: cursor.getString(cursor.getColumnIndex(MediaStore.Audio.Media.DURATION)), //时长
		 *		size: cursor.getLong(cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.SIZE))			 //文件大小
		 *	}
		 */
		getSongs(callback: any) {
			musicNotification?.initSongs(callback);
		}
		
		openNotification(config: any, callback: any) {
			console.log("初始化通知栏",config)
			//初始化通知栏
			musicNotification?.init({
				path: config.path, //跳转页面路径
				icon: config.icon //设置状态栏小图标，只有 android 8.0 以上才有效
			}, callback);
		}
		
		/**
		 * 设置桌面小部件风格
		 * @param {Object} style { bg, title, tip } 只支持 ARGB 和 RGB 的颜色值
		 */
		setWidgetStyle(style:Object) {
			musicNotification?.setWidgetStyle(style);
		}
		
		/**
		 * @return {Number} -1:未知错误 | -2:没有权限
		 */
		update(data:any) {
			return musicNotification?.update(data);
		}
		
		/**
		 * 切换通知栏播放状态
		 * @param {Boolean} playing
		 */
		playOrPause(playing:Boolean) {
			musicNotification?.playOrPause({ playing });
		}
		
		/**
		 * 没有权限，跳转设置页面
		 */
		openPermissionSetting() {
			musicNotification?.openPermissionSetting();
		}
		
		/**
		 * 收藏
		 * @param {Boolean} favour
		 */
		favour(favour = false) {
			musicNotification?.favour({ favour });
		}
		
		/**
		 * 切换音乐锁屏状态， true为开启锁屏
		 * @param {Boolean} lock
		 */
		openLockActivity(lock:boolean) {
			musicNotification?.openLockActivity({ lock });
		}
		
		/**
		 * 关闭
		 */
		cancel() {
			musicNotification?.cancel();
		}
	}
	
	return new MusicNotification();
})();