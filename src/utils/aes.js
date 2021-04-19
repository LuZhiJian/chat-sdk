import CryptoJS from 'crypto-js';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
CryptoJS.enc.u8array = {
  stringify: (wordArray) => {
    // Shortcuts
    const {
      words,
    } = wordArray;
    const {
      sigBytes,
    } = wordArray;
    // Convert
    const u8 = new Uint8Array(sigBytes);
    for (let i = 0; i < sigBytes; i++) {
      const byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff; // eslint-disable-line no-bitwise
      u8[i] = byte;
    }
    return u8;
  },
  parse: (u8arr) => {
    // Shortcut
    const len = u8arr.length;
    // Convert
    const words = [];
    for (let i = 0; i < len; i++) {
      words[i >>> 2] |= (u8arr[i] & 0xff) << (24 - (i % 4) * 8); // eslint-disable-line no-bitwise
    }
    return CryptoJS.lib.WordArray.create(words, len);
  },
};

// 转换为Uint8Array类型
export const stringToUint8Array = (str) => {
  const uint8Array = new TextEncoder('utf-8').encode(str);
  return uint8Array;
};

export const uint8ArrayToString = (fileData) => new TextDecoder('utf-8').decode(fileData);

// 加密方法 传入明文的uint8数组
export const getAesString = (array, shareKey) => {
  const key = CryptoJS.enc.Latin1.parse(shareKey);
  const acontent = array;
  // 将明文转换成WordArray
  const contentWA = CryptoJS.enc.u8array.parse(acontent);
  // 插件要求明文是base64格式
  // var dcBase64String = contentWA.toString(CryptoJS.enc.Base64)
  // 加密 选定mode是CFB类型，无偏移量
  const encrypted = CryptoJS.AES.encrypt(contentWA, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  // 将密文转回uint8数组
  const bv = CryptoJS.enc.u8array.stringify(encrypted.ciphertext);
  return bv;
};

export const getDAesString = (array, shareKey) => {
  const key = CryptoJS.enc.Latin1.parse(shareKey);
  const acontent = array;
  // 将密文转换成WordArray
  const contentWA = CryptoJS.enc.u8array.parse(acontent);
  // 插件要求密文是base64格式
  const dcBase64String = contentWA.toString(CryptoJS.enc.Base64);
  // 解密 选定mode是CFB类型，无偏移量
  const decrypted = CryptoJS.AES.decrypt(dcBase64String, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  // 将解密后的明文转回uint8数组
  const bv = CryptoJS.enc.u8array.stringify(decrypted);
  return bv;
};
