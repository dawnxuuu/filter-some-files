/**
 * 判断是不是图片
 * @param {String} str 字符串
 */
const isImage = (str) => {
  var reg = /\.(png|jpg|gif|jpeg|webp)/;
  return reg.test(str);
}

/**
 * 判断是不是vue文件
 * @param {String} str 字符串
 */
const isVue = (str) => {
  var reg = /\.(vue)/;
  return reg.test(str);
}

/**
 * 判断是不是js文件，排除
 * @param {String} str 字符串
 */
 const isJS = (str) => {
  var reg = /\.(js)/;
  const fileName = getFileNameByPath(str)
  if (fileName === 'index.server.js') return false
  return reg.test(str);
}

/**
 * 根据路径获取图片名称
 * @param {String} path 图片路径
 */
const getFileNameByPath = (path) =>{
    var filename = '';
    //如果包含有"/"号 从最后一个"/"号+1的位置开始截取字符串
    if(path.indexOf("/") !== -1) {
      filename=path.split('/').filter(item => isImage(item))
      filename=filename[0].replace(/'/g, '')
    } else {
        filename=path
    }
    return filename
}
/**
 * 数组去重
 * @param {*} arr 
 */
const distinct = (arr) => {
    return Array.from(new Set(arr))
}

/**
 * 判断JS注释
 * @param {String} str 字符串
 */
 const isJsComment = (str) => {
  var reg = /^\/\//;
  return reg.test(str);
}

module.exports = {
  isImage,
  isVue,
  isJS,
  getFileNameByPath,
  distinct,
  isJsComment
}