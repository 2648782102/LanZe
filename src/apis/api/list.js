import { request } from "../request.js";

// 随机返回一首诗词
export const PoetryRandom = () => {
  return request("poetry/random", "get");
};

// 随机返回一句诗词摘录
export const PoetryRandomExcerpt = (params) => {
  return request("poetry/random-excerpt", "get", null, params);
};

// 搜索
export const searchList = (params) => {
  return request("poetry/search", "get", null, params);
};

// 获取分类的诗词
export const PoetryClass = (params) => {
  return request("poetry/poetry-class", "get", null, params);
};

// 获取指定诗集的诗词
export const PoetryCollection = (params) => {
  return request("poetry/collection", "get", null, params);
};

// 获取用户创作的诗词
export const PoetryCustom = (params) => {
  return request("poetry/custom", "get", null, params);
};

// 花间集介绍
export const PoetryHuajianjiIntro = () => {
  return request("poetry/huajianji-intro", "get");
};

// 花间集分卷
export const PoetryHuajianji = (params) => {
  return request("poetry/huajianji", "get", null, params);
};
