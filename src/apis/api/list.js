import { request } from '../request'

// 随机返回一首诗词
export const PoetryRandom = () => {
  return request("poetry/random", "get")
}

// 搜索
export const searchList = (params) => {
  return request("poetry/search", "get",null,params)
}

// 获取分类的诗词
export const PoetryClass = (params) => {
  return request("poetry/poetry-class", "get", null,params)
}
