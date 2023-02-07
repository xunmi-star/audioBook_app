//主题配置相关
import {SeetingModule} from '@/store/modules/seeting'

/**
 * type 要更改的样式类型 
 * return class名
 */
const changeColor = function(type: string){
  let mode = SeetingModule.theme.name
  return `${mode}-${type}`
}

const changeFontColor = function(type: string){
  let mode = SeetingModule.theme.name
  return `${mode}-font-${type}`
}


// TODO 
/**
 * 
 * @param type 
 * @returns {string} 如#ffffff
 */
const changeBorderColor = function(){
  return SeetingModule.theme.borderColor
}


/**
 * type 要更改的样式类型 
 * return 颜色相关的字符串
 */
const changeStyleColor = function(type: string){
  let mode = SeetingModule.theme.name
  return `${mode}-font-${type}`
}



export default{
  changeColor,
  changeBorderColor
}