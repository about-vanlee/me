module.exports = {
  port: 3000,
  files: ['views/**/*.html', 'public/**/*.css', 'public/**/*.js'],
  server: false,
  proxy: 'localhost:3001', // 你的 Node.js 服务器端口
  notify: false, // 关闭浏览器通知
  open: false, // 不自动打开浏览器
};
