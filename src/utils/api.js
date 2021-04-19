import http from './http';

export default {
  // 登录
  login: (params) => http.post('/login/webLogin', params),
  // 联系人列表
  contactList: (params) => http.post('/contact/contactList', params),
};
