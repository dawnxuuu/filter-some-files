const fs = require('fs-extra')
var readline = require('readline')
const { isImage, getFileNameByPath, isJsComment } = require('../utils/utils')

// 单个文件的import图片语句处理
async function getHtmlSrcLineOfFile(path) {
  // 文件内容
  const fileDetail = fs.createReadStream(path)
  // 按行读取
  const rl = readline.createInterface({
      input: fileDetail
  })

  const allSrcHtml = []

  for await (const line of rl) {
    const lineString = line.toString()
    if (lineString.indexOf(':src=') !== -1) {
      allSrcHtml.push({
        path,
        lineString,
        srcNames: []
      })
    }
  }

  return allSrcHtml.length ? allSrcHtml : null
}

async function resolveHtmlSrcLine(fileList) {
  const resolveFilesPromises = fileList.map((path) => {
    return new Promise(async (resolve) => {
      const res = await getHtmlSrcLineOfFile(path)
      resolve(res)
    })
  })


  const res = await Promise.all(resolveFilesPromises)

  return res.filter(d => d)
}

module.exports = {
  resolveHtmlSrcLine
}