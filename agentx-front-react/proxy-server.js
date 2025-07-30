const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use('/api', createProxyMiddleware({
  target: 'http://localhost:8080/api',  // 你的后端地址
  changeOrigin: true,
  selfHandleResponse: false,        // 允许流式响应
  onProxyReq: (proxyReq, req, res) => {
    // 你可以在这里修改请求头，或做其他操作
  },
  onProxyRes: (proxyRes, req, res) => {
    // 关闭代理缓冲，确保流式传输
    proxyRes.headers['cache-control'] = 'no-cache';
    // 这里不主动调用 res.write / flush，交给代理中间件流转
  },
  // 其他配置可以根据需要添加
}));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`开发代理服务器启动，监听端口 ${PORT}`);
});
