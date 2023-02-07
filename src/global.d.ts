interface getAudioFromLink {
  isNoChangeAudio?: boolean,
  audioId?: number
}

/* 类型的注释文案后面再补充 */
type album = {
  author?: string,
  buyNum?: num,
  collectNum?: num,
  commentNum?: num,
  createBy?: string,
  createTime?: Date,
  downloadNum?: num,
  id?: string,
  introduction?: string,
  likeNum?: num,
  name?: string,
  playNum?: num,
  poster?: string,
  subscribeNum?: num,
  total?: num,
}

/* 类型的注释文案后面再补充 */
type audio = {
  albumId?: num,
  audioAudit?: num,
  audioStatus?: num,
  audition?: num,
  author?: string,
  buyNum?: num,
  collectNum?: num,
  commentNum?: num,
  createBy?: string,
  createTime?: Date,
  downloadNum?: num,
  duration?: num,
  id?: num,
  introduction?: string,
  isBuy?: boolean,
  isCollect?: boolean,
  isComment?: boolean,
  isDownload?: boolean,
  isLike?: boolean,
  isPlay?: boolean,
  likeNum?: boolean,
  link?: string,
  name?: string,
  nextAudioId?: num,
  playNum?: num,
  poster?: string,
  previousAudioId?: num,
  remark?: string,
  section?: num,
  size?: num,
  title?: string,
  updateBy?: string,
  updateTime?: Date,
  userId?: num,
}
interface downloadInfo {
  audioList: audio[]
  albumInfo: album,
}











