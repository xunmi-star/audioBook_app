/**
 * 分割数组，用于纯前端的分页
 * @param arr 待分割的数组
 * @param page 页码,最小值为1,默认值为1
 * @param limit 每页多少条数据，默认值为20
 * @returns {Object} flag：是否还可以分页 arr：此次分页返回的数组 page: 此次分页的页码 
 */
 const pagination = function(arr: any, page: number, limit: number){
  page = page || 1
  limit = limit || 20
  let start = ( page - 1 ) * limit
  let end = page * limit
  let flag = true
  let snap_arr = arr.slice(start,end)
  if(snap_arr.length < 20){
      flag = false
  }
  let obj = { flag: flag, arr: snap_arr, page: page}
  return obj
}

/**
 * 数字补零（音频列表有用到）
 * @param {number} num 
 * @returns string
 */
const addZero = function(num: number){
  let str = num.toString()
  let newStr = ''

  switch(str.length){
      case 1: 
          newStr =  `000${num}`; break;
      case 2: 
          newStr =  `00${num}`; break;
      case 3: 
          newStr =  `0${num}`; break;
      case 4: 
          newStr =  `${num}`; break;
  }
  if(str.length<4){
      newStr = newStr.substring(1)
  }
  return newStr
}

/**
 * 校验数组对象是否有空空数据
 * @param objArr 待校验的数组对象
 * @param msgArr 提示信息数组
 * @return 空数据对象的提示信息 
 */
// 校验
const hasEmpty =  function(objArr: any, msgArr: any){
  let keys: any = []
  let index: number|string = ''
  for (let key in objArr) {
    keys = keys.concat(key)
  }
  keys.some((item: any, i:number) => {
    index = i
    return objArr[item].length < 1
  })
  return msgArr[index]
}

/**
 * 给定一个长度，按照step将其分割成对应的数组对象
 * @param total  长度
 * @param step 步进值
 * @param section 默认值 例：在steop为20情况下，如果默认值为45，则其labal区间为41-60，其state为true
 * @returns list 返回值 例[{id: 0, start: 1, end: 20, state: false},{id: 1, start: 21, end: 40,, isSelect: false}]
 */
const initTotal = function(total: number, step: number ,section: number){
  let list = []
  let length = Math.floor(Number(total) / Number(step)) + 1
  for(let i=0; i <= length; i++){
    let start = Number(step) * i + 1
    let end = Number(step) * (i + 1)
    if(end >= total){
      end = total
    }
    let obj = {
      id: i,
      start: start,
      end: end,
      isSelect: (Number(section) >= start && Number(section) <= end ) ? true : false
    }
    
    if(i === length){
      return list
    }
    list.push(obj)
  }
}

/***
 * 按指定属性对数组进行排序
 * @param arr 待排序的数组对象
 * @param key 排序的依据
 */
const arrSort = function(arr: object[], key: string){
  arr.sort(function(a:any, b: any){
    return a[key] - b[key]
  })
  return arr
}

export default{
  pagination,
  addZero,
  hasEmpty,
  initTotal,
  arrSort
}

