const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // 处理路由
  if (req.url === '/' || req.url === '/home') {
    serveHTML('index.html', res);
  } else if (req.url.match(/\.(css|js|jpg|jpeg|png)$/)) {
    serveStatic(req.url, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
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
