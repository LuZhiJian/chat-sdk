const emojiJson = require('./emoji.json')

const escapeRegExp = str => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1')

export const parseEmoji = val => {
  val = val || ''
  Object.keys(emojiJson).forEach(v => {
    val = val.replace(new RegExp(escapeRegExp(v), 'g'),
      `<img src="${emojiJson[v]}" alt="${v}">`)
  })
  // console.log(val);
  return val
}

export const decodeEmoji = val => {
  val = val || ''
  Object.keys(emojiJson).forEach(v => {
    val = val.replace(new RegExp(escapeRegExp(`<img src="${emojiJson[v]}" alt="${v}">`), 'g'),
      v)
  })
  val = val.replace(/<br\s*\/?>/gi, '\n').replace(/&nbsp;/g, ' ')
  val = val.replace(/<(?!\/?br\/?.+?>|\/?img.+?>)[^<>]*>/gi, '')
  return val
}

export const getEmojiImgSrc = val => {
  Object.keys(emojiJson).forEach(v => {
    val = val.replace(new RegExp(escapeRegExp(v), 'g'),
      emojiJson[v])
  })
  return val
}
