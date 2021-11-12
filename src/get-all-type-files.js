const fs = require('fs-extra')

const { isImage, isVue, isJS } = require('../utils/utils')
const {
  PAGES_DIR,
  COMPONENTS_DIR,
  ASSETS_DIR
} = require('./constant')

// 所有文件
const allFilesList = []
// 所有图片文件
const allImagesPathList = []
const allImagesNameList = []

// 所有vue文件
const allVueList = []
// 所有js文件
const allJsList = []

// 所有文件归类
function walkAllFiles(path){
  var dirList = fs.readdirSync(path)

  dirList.forEach(function(item){
    if(fs.statSync(path + '/' + item).isDirectory()){
      walkAllFiles(path + '/' + item)
    }else{
      // 所有文件
      allFilesList.push(path + '/' + item)

      // 所有图片文件
      if (isImage(item)) {
        allImagesPathList.push(path + '/' + item)
        allImagesNameList.push(item)
      }

      // 所有vue文件
      if (isVue(item)) {
        allVueList.push(path + '/' + item)
      }

      // 所有js文件
      if (isJS(item)) {
        allJsList.push(path + '/' + item)
      }
    }
  })
}

function getAllTypeFiles (params) {
  walkAllFiles(PAGES_DIR)
  walkAllFiles(COMPONENTS_DIR)
  walkAllFiles(ASSETS_DIR)
  
  return {
    allFilesList,
    allImagesPathList,
    allImagesNameList,
    allVueList,
    allJsList
  }
}

module.exports = {
  getAllTypeFiles
}