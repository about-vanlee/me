const path = require('path');

// 服务器配置
const PORT = process.env.PORT || 3000;

// 目录配置
const TEMPLATE_FILE = './views/template.html';
const VIEWS_DIR = path.join(__dirname, '../../views');
const PAGES_DIR = path.join(VIEWS_DIR, 'pages');
const POSTS_DIR = path.join(__dirname, '../../content/posts');
const PUBLIC_DIR = path.join(__dirname, '../../public');

// MIME 类型映射
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

module.exports = {
  PORT,
  TEMPLATE_FILE,
  VIEWS_DIR,
  PAGES_DIR,
  POSTS_DIR,
  PUBLIC_DIR,
  MIME_TYPES,
};
