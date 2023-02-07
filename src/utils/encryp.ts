/**
 * 数据加密
 * @链接 https://blog.csdn.net/zhaotian2017/article/details/123677405
 */
import CryptoJS from 'crypto-js'

import config from "@/config"

/**
 * 将“/”全局替换为指定的加盐 或 将盐全局替换为指定的字符串
 * @param str 
 * @param isEncrypt true: 加盐  false: 解盐
 * @returns 加盐，解盐后在字符串
 */
function addSalt(str: string, isEncrypt: boolean): string{
  let newStr = str.replace(/\//g, config.AES_ADD_KEY)
  if(!isEncrypt){
    newStr = str.replace(new RegExp(config.AES_ADD_KEY,'g'), '/')
  }
  return newStr
}


// 解密  data：要加密解密的数据，AES_KEY：密钥，IV:偏移量
export const decrypt = function (data: string, AES_KEY: string, IV: string): string {
  data = addSalt(data, false)
  const key = CryptoJS.enc.Utf8.parse(AES_KEY);
  const iv = CryptoJS.enc.Utf8.parse(IV);
  const decrypt = CryptoJS.AES.decrypt(data, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString(CryptoJS.enc.Utf8);
  return decrypt;
}

// 加密
export const encrypt = function(data: string, AES_KEY: string, IV: string): string {
  const key = CryptoJS.enc.Utf8.parse(AES_KEY);
  const iv = CryptoJS.enc.Utf8.parse(IV);
  const encrypted = CryptoJS.AES.encrypt(data, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return addSalt(encrypted.toString(), true);
}
