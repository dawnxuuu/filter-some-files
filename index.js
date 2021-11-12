const fs = require('fs-extra')
const readline = require('readline')
const { flattenDepth } = require('lodash')
const { isImage, isVue, isJS, getFileNameByPath, isJsComment, distinct } = require('./utils/utils')
const { getAllTypeFiles } = require('./src/get-all-type-files')
const { resolveImportLine } = require('./src/resolve-all-import-line')
const { resolveHtmlSrcLine } = require('./src/resolve-all-html-src-line')

const {
  // 所有文件
  allFilesList,
  // 所有图片文件
  allImagesPathList,
  allImagesNameList,
  // 所有vue文件
  allVueList,
  // 所有js文件
  allJsList
} = getAllTypeFiles();

fs.writeFileSync('./output/allImagesPathList.json', JSON.stringify(allImagesPathList,"","\t"));


(async function exe() {
// js文件import行处理
let allJsFileImportList = await resolveImportLine(allJsList);
// vue文件import行处理
let allVueFileImportList = await resolveImportLine(allVueList);
fs.writeFileSync('./output/allJsFileImportList.json', JSON.stringify(allJsFileImportList,"","\t"))
fs.writeFileSync('./output/allVueFileImportList.json', JSON.stringify(allVueFileImportList,"","\t"))


  // 所有被import过的图片文件名
  let allImportedImagesFileName = []
  let allImportedName = []
  {
    allJsFileImportList.concat(allVueFileImportList).map(item => {
      item.forEach(i => {
        allImportedImagesFileName.push(i.imageName)
        allImportedName.push(i.importName)
      })
    })

    allImportedImagesFileName = distinct(allImportedImagesFileName)
    allImportedName = distinct(allImportedName)
  }

  
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
  let allSrcHtml = await resolveHtmlSrcLine(allVueList);
  allSrcHtml = flattenDepth(allSrcHtml, 2)
  fs.writeFileSync('./output/allSrcHtml.json', JSON.stringify(allSrcHtml,"","\t"))
  // 未被:src=使用的import名称
  let srcUnusedImportedName = allImportedName.filter(v => !allSrcHtml.some(i => i.lineString.indexOf(v) !== -1))
  fs.writeFileSync('./output/srcUnusedImportedName.json', JSON.stringify(srcUnusedImportedName,"","\t"))


  ////////////////////////////////////////////////////
  fs.writeFileSync('./output/allImportedName.json', JSON.stringify(allImportedName,"","\t"))


  // vue文件中使用过的import name，排除import语句
  let vueUsedImportNames = []

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
  // let anywhereUnusedImportedName = [];


  // console.log('=xu=allImportedName.length', allImportedName.length)
  // console.log('=xu= unusedImportedName', srcUnusedImportedName)
})();
