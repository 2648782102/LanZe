import axios from 'axios'
// import { ElMessage } from 'element-plus'
import { baseUrl } from './env';

export const request = async (url, method, data, params) => {
    try {

        // 发起请求
        let response = await axios({
            url: `${baseUrl+url}`,
            method,
            data,
            params
        });

        // 检查响应状态码
        if (response.status !== 200) {
            // 显示错误消息
            ElMessage({
                duration: 3000,
                message: "网络出现异常请重试",
                type: 'error',
            })
        }

        // 返回响应数据
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};