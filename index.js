const fs = require('fs-extra')
var readline =  require('readline')
const { isImage, isVue, isJS, getFileNameByPath, isJsComment, distinct } = require('./utils/utils')

const PAGES_DIR = '/Users/xuxiao/b-mobile/weex-b-app/pages'
const COMPONENTS_DIR = '/Users/xuxiao/b-mobile/weex-b-app/components'
const ASSETS_DIR = '/Users/xuxiao/b-mobile/weex-b-app/assets'

// 所有文件
const allFilesList = []
// 所有图片文件
const allImagesPathList = []
const allImagesNameList = []

// 所有vue文件
const allVueList = []
// 所有js文件
const allJsList = []

// 所有:src=语句
let allSrcHtml = []

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

        fs.writeFileSync('./output/allImagesPathList.json', JSON.stringify(allImagesPathList,"","\t"))
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

walkAllFiles(PAGES_DIR)
walkAllFiles(COMPONENTS_DIR)
walkAllFiles(ASSETS_DIR)

// 单个文件的import图片语句处理
async function getImportLineOfFile(path) {
  // 文件内容
  const fileDetail = fs.createReadStream(path)
  // 按行读取
  const rl = readline.createInterface({
      input: fileDetail
  })

  const importLineList = []

  for await (const line of rl) {
    const lineString = line.toString()
    // 是否import图片的语句，且排除注释掉的
    if (lineString.indexOf('import') !== -1 && isImage(lineString) && !isJsComment(lineString)) {
      // 以空格分离语句
      const lineSplitArr = lineString.split(' ')
      // 引用名
      const importName = lineSplitArr[lineSplitArr.indexOf('import') + 1]
      // 图片名
      const imageName = getFileNameByPath(lineSplitArr[lineSplitArr.indexOf('from') + 1])

      importLineList.push({
        path: path,
        lineString,
        importName: importName,
        imageName: imageName
      })
    }

    if (lineString.indexOf(':src=') !== -1) {
      allSrcHtml.push({
        path,
        lineString,
        srcNames: []
      })
    }
  }

  return importLineList.length ? importLineList : null
}

// 处理js文件
let allJsFileImportList = []

const resolveJsFilesPromises = allJsList.map((path) => {
  return new Promise(async (resolve) => {
    const res = await getImportLineOfFile(path)
    resolve(res)
  })
})

async function resolveJsFiles() {
  allJsFileImportList = (await Promise.all(resolveJsFilesPromises)).filter(d => d)
  fs.writeFileSync('./output/allJsFileImportList.json', JSON.stringify(allJsFileImportList,"","\t"))
}


// 处理vue文件
let allVueFileImportList = []

const resolveVueFilesPromises = allVueList.map((path) => {
  return new Promise(async (resolve) => {
    const res = await getImportLineOfFile(path)
    resolve(res)
  })
})

async function resolveVueFiles() {
  allVueFileImportList = (await Promise.all(resolveVueFilesPromises)).filter(d => d)
  fs.writeFileSync('./output/allVueFileImportList.json', JSON.stringify(allVueFileImportList,"","\t"))
}


// 所有被import过的图片文件名
let allImportedImagesFileName = []
let allImportedName = []
function getAllImportedImagesFileName() {
  [...allJsFileImportList, ...allVueFileImportList].map(item => {
    item.forEach(i => {
      allImportedImagesFileName.push(i.imageName)
      allImportedName.push(i.importName)
    })
  })

  allImportedImagesFileName = distinct(allImportedImagesFileName)
  allImportedName = distinct(allImportedName)
}


(async function exe() {
  await resolveJsFiles();
  await resolveVueFiles();

  getAllImportedImagesFileName();
  
  // 引用过的图片文件名称
  let imported = allImportedImagesFileName.filter(v => allImagesNameList.includes(v))
  // 未引用过的图片文件名称
  let unImported = allImportedImagesFileName.concat(allImagesNameList).filter(v => !allImportedImagesFileName.includes(v) || !allImagesNameList.includes(v))
  // 未引用过的图片文件地址
  let unImportedImagePathList = allImagesPathList.filter(v => unImported.some(i => v.indexOf(i) !== -1))
  fs.writeFileSync('./output/unImportedImagePathList.json', JSON.stringify(unImportedImagePathList,"","\t"))
  // 删除未引用过的图片文件
  // unImportedImagePathList.forEach(i => fs.rmSync(i))

  // 所有:src=语句
  fs.writeFileSync('./output/allSrcHtml.json', JSON.stringify(allSrcHtml,"","\t"))
  // 未被:src=使用的import名称
  let srcUnusedImportedName = allImportedName.filter(v => !allSrcHtml.some(i => i.lineString.indexOf(v) !== -1))
  fs.writeFileSync('./output/srcUnusedImportedName.json', JSON.stringify(srcUnusedImportedName,"","\t"))


  ////////////////////////////////////////////////////
  // fs.writeFileSync('./output/allImportedName.json', JSON.stringify(allImportedName,"","\t"))


  //   // vue文件中使用过的import name，排除import语句
  // let vueUsedImportNames = []

  // async function getVueUsedImportNamesByline(path) {
  //   // 文件内容
  //   const fileDetail = fs.createReadStream(path)
  //   // 按行读取
  //   const rl = readline.createInterface({
  //     input: fileDetail
  //   })

  //   let usedImportedNames = []

  //   for await (const line of rl) {
  //     const lineString = line.toString()

  //     if (lineString.indexOf('import') !== -1 && isImage(lineString)) {

  //     } else {
  //       const usedNames = allImportedName.filter(v => lineString.indexOf(v) !== -1)
  //       if (usedNames.length) {
  //         usedImportedNames = usedImportedNames.concat(usedNames)
  //       }
  //     }
  //   }

  //   return distinct(usedImportedNames)
  // }

  // const getVueUsedImportNamesPromises = allVueList.map((path) => {
  //   return new Promise(async (resolve) => {
  //     const res = await getVueUsedImportNamesByline(path)
  //     resolve(res)
  //   })
  // })

  // async function getVueUsedImportNames() {
  //   vueUsedImportNames = await Promise.all(getVueUsedImportNamesPromises)
  // }

  // await getVueUsedImportNames()

  // fs.writeFileSync('./output/vueUsedImportNames.json', JSON.stringify(vueUsedImportNames,"","\t"))
  ////////////////////////////////////////////////////


  // 未被:src=使用，也未被vue script使用的import名称
  let anywhereUnusedImportedName = []


  // console.log('=xu=allImportedName.length', allImportedName.length)
  // console.log('=xu= unusedImportedName', srcUnusedImportedName)
})();
