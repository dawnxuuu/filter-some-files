const fs = require('fs-extra')
var readline = require('readline')
const { isImage, getFileNameByPath, isJsComment } = require('../utils/utils')

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
  }

  return importLineList.length ? importLineList : null
}

async function resolveImportLine(fileList) {
  const resolveFilesPromises = fileList.map((path) => {
    return new Promise(async (resolve) => {
      const res = await getImportLineOfFile(path)
      resolve(res)
    })
  })


  const res = await Promise.all(resolveFilesPromises)

  return res.filter(d => d)
}

module.exports = {
  resolveImportLine
}