const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const PORT = process.env.PORT || 3000;

const TEMPLATE_FILE = './views/template.html';
// 确保定义了所有必需的常量
const VIEWS_DIR = path.join(__dirname, 'views');
const PAGES_DIR = path.join(VIEWS_DIR, 'pages');

// 添加 MIME 类型映射
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
};

const pages = {
  '/': {
    title: '首页',
    file: 'home.html',
    active: 'home',
  },
  '/ai': {
    title: 'AI 学习',
    file: 'ai.html',
    active: 'ai',
  },
  '/html': {
    title: 'HTML 教程',
    file: 'html.html',
    active: 'html',
    isHTML: true, // 标记这是 HTML 页面
  },
  '/html/basic': {
    title: 'HTML 基础课程',
    file: 'html/basic.html',
    active: 'html',
    isHTML: true,
    htmlSection: 'basic',
  },
  '/html/advanced': {
    title: 'HTML 高级课程',
    file: 'html/advanced.html',
    active: 'html',
    isHTML: true,
    htmlSection: 'advanced',
  },
  '/html/blog': {
    title: 'HTML 博客',
    file: 'html/blog.html',
    active: 'html',
    isHTML: true,
    htmlSection: 'blog',
  },
  '/css': {
    title: 'CSS 教程',
    file: 'css.html',
    active: 'css',
  },
  '/javascript': {
    title: 'JavaScript 教程',
    file: 'javascript.html',
    active: 'js',
  },
};

async function renderPage(route) {
  try {
    // 1. 首先检查路由是否存在
    if (!pages[route]) {
      throw new Error('Page not found');
    }

    // 2. 读取模板文件
    const templatePath = path.join(VIEWS_DIR, 'template.html');
    let template = await fs.readFile(templatePath, 'utf-8');

    // 3. 获取页面信息
    const pageInfo = pages[route];

    // 4. 读取页面内容
    const contentPath = path.join(PAGES_DIR, pageInfo.file);
    let content;
    try {
      content = await fs.readFile(contentPath, 'utf-8');
    } catch (err) {
      console.error(`无法读取页面文件: ${contentPath}`);
      content = '<h1>页面内容未找到</h1>';
    }

    // 5. 设置导航激活状态
    const activeStates = {
      home: '',
      ai: '',
      html: '',
      css: '',
      js: '',
    };
    activeStates[pageInfo.active] = 'class="active"';

    // 设置 HTML 二级导航的激活状态
    const htmlSubNavStates = {
      basic: '',
      advanced: '',
      blog: '',
    };

    if (pageInfo.htmlSection) {
      htmlSubNavStates[pageInfo.htmlSection] = 'class="active"';
    }

    // 6. 替换模板变量
    template = template
      .replace('{{title}}', pageInfo.title)
      .replace('{{content}}', content)
      .replace('{{activeHOME}}', activeStates.home)
      .replace('{{activeAI}}', activeStates.ai)
      .replace('{{activeHTML}}', activeStates.html)
      .replace('{{activeCSS}}', activeStates.css)
      .replace('{{activeJS}}', activeStates.js)
      .replace('{{#if isHTML}}', pageInfo.isHTML ? '' : '<!--')
      .replace('{{/if}}', pageInfo.isHTML ? '' : '-->')
      .replace('{{activeHTMLBasic}}', htmlSubNavStates.basic)
      .replace('{{activeHTMLAdvanced}}', htmlSubNavStates.advanced)
      .replace('{{activeHTMLBlog}}', htmlSubNavStates.blog);

    return template;
  } catch (err) {
    console.error('渲染页面时出错:', err);
    throw err;
  }
}

// 服务器处理函数也需要相应更新
const server = http.createServer(async (req, res) => {
  // 处理静态文件请求
  if (req.url.startsWith('/public/')) {
    const served = await serveStaticFile(req, res);
    if (served) return;
  }

  try {
    const route = req.url;

    // 尝试渲染页面
    try {
      const page = await renderPage(route);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(page);
    } catch (err) {
      if (err.message === 'Page not found') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 - 页面未找到</h1>');
      } else {
        throw err; // 将其他错误传递给外部错误处理
      }
    }
  } catch (err) {
    console.error('服务器错误:', err);
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>500 - 服务器内部错误</h1>');
  }
});

// 处理 HTML 文件
function serveHTML(filename, res) {
  const filePath = path.join(__dirname, 'views', filename);
  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server Error');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content);
  });
}

// 处理静态文件的函数
async function serveStaticFile(req, res) {
  try {
    const filePath = path.join(__dirname, req.url);
    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'text/plain';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
    return true;
  } catch (err) {
    return false;
  }
}

// 处理静态文件
function serveStatic(url, res) {
  const filePath = path.join(__dirname, 'public', url);
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }

    const ext = path.extname(url);
    let contentType = 'text/plain';

    switch (ext) {
      case '.css':
        contentType = 'text/css';
        break;
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
