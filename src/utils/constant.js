const env = process.env.NODE_ENV

export default {
  // 版本号
  VERSION: '1.0.0',
  SDK_VERSION: 1,
  // 密码加密 key
  API_KEY: '1234560000000000',
  baseUrl: env === 'production' ? 'http://47.119.126.109:8080' : '/api',
  wsUrl: 'ws://47.119.126.109:9500'
};
