module.exports = {
  base: './',   // 打包时使用绝对路径打包
    proxy: { 
      '/api': {
        target: 'http://localhost:801',  //你要跨域访问的网址
        changeOrigin: true,   // 允许跨域
        rewrite: (path) => path.replace(/^\/api/, '') // 重写路径把路径变成空字符
      }
    }
}

