module.exports = {
  base: './',   // 打包时使用绝对路径打包
    proxy: { 
      '/api': {
        target: 'http://localhost:5565',  //你要跨域访问的网址
        changeOrigin: true,   // 允许跨域
        pathRewrite: {
          '^/api': ''   // 重写路径: 去掉路径中开头的'/api'
        }
      }
    }
}

