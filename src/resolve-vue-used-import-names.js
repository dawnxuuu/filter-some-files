const fs = require('fs-extra')
var readline = require('readline')
const { isImage, isVue, isJS, getFileNameByPath, isJsComment, distinct } = require('../utils/utils')

// vue文件使用的import names
async function getVueUsedImportNamesByline(path, allImportedName) {
  // 文件内容
  const fileDetail = fs.createReadStream(path)
  // 按行读取
  const rl = readline.createInterface({
    input: fileDetail
  })

  let usedImportedNames = []

  for await (const line of rl) {
    const lineString = line.toString()

    if (lineString.indexOf('import') !== -1 && isImage(lineString)) {

    } else {
      const usedNames = allImportedName.filter(v => lineString.indexOf(v) !== -1)
      if (usedNames.length) {
        usedImportedNames = usedImportedNames.concat(usedNames)
      }
    }
  }

  return distinct(usedImportedNames)
}

async function resolveVueUsedImportNames(fileList, allImportedName) {
  const resolveFilesPromises = fileList.map((path) => {
    return new Promise(async (resolve) => {
      const res = await getVueUsedImportNamesByline(path, allImportedName)
      resolve(res)
    })
  })


  const res = await Promise.all(resolveFilesPromises)

  return res.filter(d => d)
}

module.exports = {
  resolveVueUsedImportNames
}