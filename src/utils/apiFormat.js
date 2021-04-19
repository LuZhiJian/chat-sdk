import { getAesString, getDAesString, stringToUint8Array, uint8ArrayToString } from './aes'

export const initByte = (params, commonKey) => {
  const dataBytes = stringToUint8Array(params)
  const sendMsg = getAesString(dataBytes, commonKey);
  // const sendMsg = params;
  const { length } = sendMsg;
  const buf = new ArrayBuffer(4 + length);
  const dv = new DataView(buf);
  dv.setUint32(0, length, false);
  for (let i = 0; i < length; i++) {
    dv.setUint8(i + 4, sendMsg[i]);
  }
  return buf;
};

export const initJson = (result, commonKey) => new Promise((resolve) => {
  if (!result) { resolve(result); return false }
  const readerC = new FileReader();
  readerC.readAsArrayBuffer(result);
  readerC.onload = () => {
    const buff = readerC.result;
    const content = getDAesString(new Uint8Array(buff.slice(4)), commonKey);
    const res = JSON.parse(uint8ArrayToString(content));
    resolve(res);
  };
});
