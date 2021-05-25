import md5 from 'js-md5'
import CryptoJS from 'crypto-js'
import u8arrayAdd from 'arraybuffer-concat'

CryptoJS.enc.u8array = {
  stringify: (wordArray) => {
    // Shortcuts
    var words = wordArray.words;
    var sigBytes = wordArray.sigBytes;
    // Convert
    var u8 = new Uint8Array(sigBytes);
    for (var i = 0; i < sigBytes; i++) {
      var byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
      u8[i] = byte;
    }
    return u8;
  },
  parse: (u8arr) => {
    // Shortcut
    var len = u8arr.length;
    // Convert
    var words = [];
    for (var i = 0; i < len; i++) {
      words[i >>> 2] |= (u8arr[i] & 0xff) << (24 - (i % 4) * 8);
    }
    return CryptoJS.lib.WordArray.create(words, len);
  }
}

onmessage = function(evt){
  //向主线程发送消息
  const arraybuf = evt.data.arraybuf
  const size = evt.data.size
  const ffStr = 'FILESECRET'
  const key = 123456000000000
  const filename = evt.data.filename
  const isDaes = evt.data.isDaes

  if (isDaes) {
    const len = arraybuf.byteLength
    let arraybuffer = new Uint8Array(0)
    const pageArray = new Array(Math.ceil(len / size)).join(',').split(',')

    pageArray.map((v, i) => {
      if ((i + 1) * size >= len) {
        var klast = new Uint8Array(arraybuf.slice(i * size, len))
        var contentWA = CryptoJS.enc.u8array.parse(klast)
        var dcBase64String = contentWA.toString(CryptoJS.enc.Base64)
        var decrypted = CryptoJS.AES.decrypt(dcBase64String, key, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7
        })
        // 将解密后的明文转回uint8数组
        var bv = CryptoJS.enc.u8array.stringify(decrypted)
        // console.log(uint8String)
        arraybuffer = u8arrayAdd(arraybuffer, bv)
        postMessage({
          arraybuffer: arraybuffer,
          filename: filename,
          attkey: iiattKey
        })
      } else {
        var klast = new Uint8Array(arraybuf.slice(i * size, (i + 1) * size))
        var contentWA = CryptoJS.enc.u8array.parse(klast)
        var dcBase64String = contentWA.toString(CryptoJS.enc.Base64)
        var decrypted = CryptoJS.AES.decrypt(dcBase64String, key, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7
        })
        // 将解密后的明文转回uint8数组
        var bv = CryptoJS.enc.u8array.stringify(decrypted)
        arraybuffer = u8arrayAdd(arraybuffer, bv)
      }
    })
  } else {
    const len = arraybuf.byteLength
    let arraybuffer = new Uint8Array(0)
    const pageArray = new Array(Math.ceil(len / size)).join(',').split(',')
    pageArray.map((v, i) => {
      if ((i + 1) * size >= arraybuf.byteLength) {
        var klast = new Uint8Array(arraybuf.slice(i * size, len))
        var contentWA = CryptoJS.enc.u8array.parse(klast)
        var encrypted = CryptoJS.AES.encrypt(contentWA, key, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7
        })
        var bv = CryptoJS.enc.u8array.stringify(encrypted.ciphertext)
        arraybuffer = u8arrayAdd(arraybuffer, bv)
        postMessage({
          uploadBlob: new Blob([arraybuffer]),
          attKey: attkey
        })
      } else {
        var klast = new Uint8Array(arraybuf.slice(i * size, (i + 1) * size))
        var contentWA = CryptoJS.enc.u8array.parse(klast)
        var encrypted = CryptoJS.AES.encrypt(contentWA, key, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7
        })
        var bv = CryptoJS.enc.u8array.stringify(encrypted.ciphertext)
        arraybuffer = u8arrayAdd(arraybuffer, bv)
        console.log((i + 1) * size/arraybuf.byteLength)
      }
    })
  }
}

//错误信息
onerror = function (event) {
  console.log(event.message)
}
