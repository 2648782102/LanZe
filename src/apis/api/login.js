import { request } from '../request'

// 登录相关
// 登录
export const userLogin = (data) => {
        return request("user/login", "post", data)
}

// 注册
export const userReg = (data) => {
        return request("user/reg", "post", data)
}

// 修改密码
export const userUpdate = (data) => {
        return request("user/update", "post", data)
}
