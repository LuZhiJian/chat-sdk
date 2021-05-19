import http from './http';

export default {
  // 登录
  login: (params) => http.post('/login/webLogin', params),
  // 联系人列表
  contactList: (params) => http.post('/contact/contactList', params),
  // 获取上传路径
  getUploadUrl: (params) => http.post('/sys/getUploadUrl', params),
  // 获取oss上传token
  getOSSToken: (params) => http.post('/sys/getOSSToken', params),
  // 联系人详情
  contactDetail: (params) => http.post('/contact/contactDetail', params),
  // 联系人申请列表
  contactApplyList: (params) => http.post('/contact/contactApplyList', params),
  // 更新好友申请
  updateApply: (params) => http.post('/contact/updateContactApply', params),
};
