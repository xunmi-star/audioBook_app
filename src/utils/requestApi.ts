const api = {
  // 登录鉴权模块
  captchaImage: '/captchaImage',//获取验证码
  getToken: '/login',//获取token令牌(用户登陆)
  getInfo: '/getInfo',//根据token获取用户数据
  getAudienceUser: '/audience/security/getAudienceUser',//获取用户扩展信息
  addAudienceUser: '/audience/security/addAudienceUser',//新增用户扩展信息
  logout: '/logout',//用户登出
  register: '/register',//用户注册
  
  //首页模块
  albumList: '/audience/home/albumList',//获取专辑列表
  getAudioByAlbumId: '/audience/home/getAudioByAlbumId',//根据专辑ID获取音频列表
  getAudioByAudioId: '/audience/home/getAudioByAudioId',//根据专辑ID获取音频明细
  subscribeAlbum: '/audience/home/subscribeAlbum',//专辑订阅(指专辑订阅)
  unSubscribeAlbum: '/audience/home/unSubscribeAlbum',//取消专辑订阅(指专辑订阅)
  imageList: '/audience/home/imageList',//首页获取轮播图


  //我听模块
  followUpList: '/audience/myListening/followUpList',//追更清单
  followUpRead: '/audience/myListening/followUpRead',//追更状态设为已读
  subscribeList: '/audience/myListening/subscribeList',//订阅清单
  collectAlbumList: '/audience/myListening/collectAlbumList',//收藏的专辑清单
  collectAudioList: '/audience/myListening/collectAudioList',//收藏的音频清单
  historyList: '/audience/myListening/historyList',//历史清单
  downloadAudioList: '/audience/myListening/downloadAudioList',//下载音频清单
  downloadAlbumList: '/audience/myListening/downloadAlbumList',//下载专辑清单

  //播放模块
  audioCollect: 'audience/play/collect',//音频收藏
  recordPlay: 'audience/play/recordPlay',//添加音频播放记录
  revokeCollect: 'audience/play/revokeCollect',//音频取消收藏
  audioComment: '/audience/play/comment',//音频评论
  getAudioCommentReply: '/audience/comment/list',//获取音频评论回复
  getCommentByAudioId: '/audience/play/getCommentByAudioId',//获取音频评论
  revokeComment: '/audience/play/revokeComment',//音频评论撤销
  audioThumbUp: '/audience/play/like',//音频点赞
  revokeThumbUp: '/audience/play/revokeLike',//取消音频点赞
  recordDownload: '/audience/play/recordDownload',//新增音频下载记录
  recordBuy: '/audience/play/recordBuy',//新增音频购买记录

  //发现模块
  noticeList: '/audience/find/list',//获取通知公告列表
  noticeInfo: '/audience/find',//获取通知公告明细
  currentVersion: '/audience/version/currentVersion',//获取App版本

  //设置模块
  updateUserAvatar: '/audience/setting/updateUserAvatar',//更新用户头像
  updateUserInfo: '/audience/setting/updateUserInfo',//更新用户信息
  updateAudienceUserInfo: '/audience/setting/updateAudienceUserInfo',//更新用户拓展信息
  addFeedBack: '/audience/setting/saveFeedback',//新增帮助反馈
  myFeedbackList: '/audience/setting/myFeedbackList',//我的反馈记录
}

export default{
  api,
}