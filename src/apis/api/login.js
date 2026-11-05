import { request } from "../request.js";

// 登录相关
// 登录
export const userLogin = (data) => {
  return request("user/login", "post", data);
};

// 注册
export const userReg = (data) => {
  return request("user/reg", "post", data);
};

// 修改密码
export const userUpdate = (data) => {
  return request("user/update", "post", data);
};

export const userDelete = (data) => {
  return request("user/delete", "post", data);
};

export const userProfile = (params) => {
  return request("user/profile", "get", null, params);
};

export const userProfileUpdate = (data) => {
  return request("user/profile/update", "post", data);
};

export const userPublishPoem = (data) => {
  return request("user/poem/publish", "post", data);
};
